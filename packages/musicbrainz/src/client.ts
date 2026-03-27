/**
 * MusicBrainz API client with rate limiting, recording search, artist lookup, and multi-proxy support.
 * All MusicBrainz `ws/2` traffic goes through configured proxies only (no direct MB).
 * Cover Art Archive requests are not rate-limited in this client (direct HTTP to coverartarchive.org).
 * @see https://musicbrainz.org/doc/MusicBrainz_API
 * @see https://musicbrainz.org/doc/MusicBrainz_API/Search/RecordingSearch
 * @see https://musicbrainz.org/doc/MusicBrainz_API/Lookup
 */

import type { IArtist, IRecordingList, IRelease } from './types.js'

const MB_BASE = 'https://musicbrainz.org/ws/2'

export interface MusicBrainzApiOptions {
  /** Application name (required for User-Agent). */
  appName: string
  /** Application version. */
  appVersion: string
  /** Contact (email or URL) for the application. */
  appContactInfo: string
  /**
   * [maxRequests, windowSeconds] per proxy URL. Default: [1, 1].
   * @see https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting
   */
  rateLimit?: [number, number]
  /**
   * Proxy URLs (e.g. Cloudflare Workers). Required for MusicBrainz API calls.
   * Proxy is called with query params: target=<encoded-url>, user_agent=<identity> and optional header X-Harmony-Secret.
   */
  proxyUrls?: string[]
  /**
   * Secret sent as X-Harmony-Secret when calling proxy URLs.
   */
  proxyAuthSecret?: string
}

export interface SearchRecordingParams {
  artist: string
  recording: string
  release?: string
}

export interface SearchRecordingOptions {
  limit?: number
  offset?: number
}

/** Include parameters for artist lookup (e.g. "url-rels", "releases"). */
export type ArtistInclude =
  | 'url-rels'
  | 'releases'
  | 'release-groups'
  | 'recordings'
  | 'works'
  | string

/**
 * Builds a Lucene-style query string for recording search.
 * Escapes double quotes in values.
 */
function buildRecordingQuery(params: SearchRecordingParams): string {
  const escape = (s: string) => s.replace(/"/g, '\\"')
  const parts = [`artist:"${escape(params.artist)}"`, `recording:"${escape(params.recording)}"`]
  if (params.release) {
    parts.push(`release:"${escape(params.release)}"`)
  }
  return parts.join(' AND ')
}

/**
 * Rate limiter: at most N requests per window of W seconds.
 */
function createRateLimiter(maxRequests: number, windowSeconds: number) {
  const timestamps: number[] = []
  return async function waitIfNeeded(): Promise<void> {
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000
    while (timestamps.length > 0 && timestamps[0]! < windowStart) {
      timestamps.shift()
    }
    if (timestamps.length >= maxRequests) {
      const waitMs = timestamps[0]! + windowSeconds * 1000 - now
      if (waitMs > 0) {
        await new Promise((r) => setTimeout(r, waitMs))
        return waitIfNeeded()
      }
    }
    timestamps.push(now)
  }
}

/**
 * Proxy manager: rotates through proxies and manages rate limiting per proxy.
 */
class ProxyManager {
  private readonly proxies: string[]
  private readonly rateLimiters: Map<string, () => Promise<void>>
  private currentIndex = 0

  constructor(proxyUrls: string[], rateLimit: [number, number]) {
    this.proxies = proxyUrls
    this.rateLimiters = new Map()

    for (const proxyUrl of proxyUrls) {
      this.rateLimiters.set(proxyUrl, createRateLimiter(rateLimit[0], rateLimit[1]))
    }
  }

  /**
   * Get next proxy URL in round-robin fashion.
   */
  getNextProxy(): string | null {
    if (this.proxies.length === 0) return null
    const proxy = this.proxies[this.currentIndex % this.proxies.length]
    this.currentIndex++
    return proxy ?? null
  }

  /**
   * Wait for rate limit on a specific proxy.
   */
  async waitForProxy(proxyUrl: string): Promise<void> {
    const limiter = this.rateLimiters.get(proxyUrl)
    if (limiter) await limiter()
  }

  getAllProxies(): string[] {
    return [...this.proxies]
  }
}

export class MusicBrainzApi {
  private readonly userAgent: string
  private readonly proxyAuthSecret: string | undefined
  private readonly proxyManager: ProxyManager | null

  constructor(options: MusicBrainzApiOptions) {
    const {
      appName,
      appVersion,
      appContactInfo,
      rateLimit = [1, 1],
      proxyUrls = [],
      proxyAuthSecret,
    } = options
    this.proxyAuthSecret = proxyAuthSecret

    this.userAgent = `${appName}/${appVersion} ( ${appContactInfo} )`

    this.proxyManager = proxyUrls.length > 0 ? new ProxyManager(proxyUrls, rateLimit) : null
  }

  /**
   * Fetch via proxy: target and user_agent as query params; optional X-Harmony-Secret header.
   */
  private async fetchViaProxy(proxyUrl: string, targetUrl: string): Promise<Response> {
    await this.proxyManager!.waitForProxy(proxyUrl)

    const params = new URLSearchParams()
    params.set('target', targetUrl)
    params.set('user_agent', this.userAgent)
    const finalUrl = `${proxyUrl.replace(/\/?$/, '')}?${params.toString()}`

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (this.proxyAuthSecret) {
      headers['X-Harmony-Secret'] = this.proxyAuthSecret
    }

    return fetch(finalUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000),
    })
  }

  /**
   * MusicBrainz `ws/2` requests only: one attempt via round-robin proxy. No direct MB, no retry on other proxies.
   */
  private async executeRequest(url: string): Promise<Response> {
    if (!this.proxyManager) {
      throw new Error('MusicBrainz API: configure proxyUrls to call MusicBrainz')
    }
    const proxy = this.proxyManager.getNextProxy()
    if (!proxy) {
      throw new Error('MusicBrainz API: configure proxyUrls to call MusicBrainz')
    }
    return this.fetchViaProxy(proxy, url)
  }

  /**
   * True for the CAA *entry* URL only (`/release/{mbid}/front`), not for `.../mbid.jpg` files.
   */
  private isCaaReleaseFrontEntryUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      const host = parsed.hostname.replace(/^www\./, '')
      if (host !== 'coverartarchive.org') return false
      return /^\/release\/[^/]+\/front\/?$/.test(parsed.pathname)
    } catch {
      return false
    }
  }

  /**
   * Follow `Location` manually — works even when `redirect: follow` + `response.url` stay wrong in some runtimes.
   */
  private async followCaaManualRedirects(startUrl: string): Promise<string | null> {
    let nextUrl = startUrl
    for (let hop = 0; hop < 20; hop++) {
      const res = await fetch(nextUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': '*/*',
        },
        signal: AbortSignal.timeout(60000),
      })

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location')
        await res.arrayBuffer().catch(() => {})
        if (!loc) return null
        nextUrl = new URL(loc, nextUrl).href
        continue
      }

      if (res.ok) {
        await res.arrayBuffer()
        return nextUrl
      }

      await res.arrayBuffer().catch(() => {})
      return null
    }

    return null
  }

  /**
   * Final image URL (e.g. `*.ca.archive.org/.../....jpg`). Direct fetch to CAA, not via MusicBrainz proxy.
   * @see https://musicbrainz.org/doc/Cover_Art_Archive/API
   */
  async getReleaseCoverArtFrontUrl(releaseMbid: string): Promise<string | null> {
    const caaFront = `https://coverartarchive.org/release/${encodeURIComponent(releaseMbid)}/front`
    try {
      const res = await fetch(caaFront, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': '*/*',
        },
      })

      return res.url
    } catch {
      return null
    }
  }

  /**
   * Search recordings by artist, recording title, and optionally release title.
   * GET /ws/2/recording?fmt=json&query=...&limit=...&offset=...&inc=...
   */
  async searchRecording(
    params: SearchRecordingParams,
    opts: SearchRecordingOptions = {}
  ): Promise<IRecordingList> {
    const { limit = 1, offset = 0 } = opts
    const query = buildRecordingQuery(params)
    const url = new URL(`${MB_BASE}/recording`)
    url.searchParams.set('fmt', 'json')
    url.searchParams.set('query', query)
    url.searchParams.set('limit', String(Math.min(100, Math.max(1, limit))))
    url.searchParams.set('offset', String(Math.max(0, offset)))
    url.searchParams.set('inc', 'releases+recordings+media')

    const res = await this.executeRequest(url.toString())

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`MusicBrainz API error ${res.status}: ${text}`)
    }

    return (await res.json()) as IRecordingList
  }

  /**
   * Look up an artist by MusicBrainz ID (MBID).
   * GET /ws/2/artist/{mbid}?inc=...&fmt=json
   */
  async getArtist(mbid: string, inc?: ArtistInclude[]): Promise<IArtist> {
    const url = new URL(`${MB_BASE}/artist/${encodeURIComponent(mbid)}`)
    url.searchParams.set('fmt', 'json')
    if (inc?.length) {
      url.searchParams.set('inc', inc.join('+'))
    }

    const res = await this.executeRequest(url.toString())

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`MusicBrainz API error ${res.status}: ${text}`)
    }

    return (await res.json()) as IArtist
  }

  /**
   * Look up a release by MusicBrainz ID (MBID) with full details including tracks.
   * GET /ws/2/release/{mbid}?inc=...&fmt=json
   */
  async getRelease(mbid: string, inc: string[] = ['recordings', 'media']): Promise<IRelease> {
    const url = new URL(`${MB_BASE}/release/${encodeURIComponent(mbid)}`)
    url.searchParams.set('fmt', 'json')
    if (inc.length) {
      url.searchParams.set('inc', inc.join('+'))
    }

    const res = await this.executeRequest(url.toString())

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`MusicBrainz API error ${res.status}: ${text}`)
    }

    return (await res.json()) as IRelease
  }

  /**
   * Number of configured proxies (0 if none).
   */
  getProxyCount(): number {
    return this.proxyManager?.getAllProxies().length ?? 0
  }
}
