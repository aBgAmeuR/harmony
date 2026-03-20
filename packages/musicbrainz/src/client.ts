/**
 * MusicBrainz API client with rate limiting, recording search, artist lookup, and multi-proxy support.
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
  /** Disable rate limiting. Default: false. Not recommended: MusicBrainz enforces ~1 req/s per IP. */
  disableRateLimiting?: boolean
  /**
   * [maxRequests, windowSeconds]. Default: [1, 1] (1 request per second).
   * Applied per proxy URL + direct connection.
   * @see https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting — "Source IP address" limit is 1 req/s.
   */
  rateLimit?: [number, number]
  /**
   * Array of proxy URLs (e.g., Cloudflare Workers) to distribute requests.
   * Each proxy has its own rate limiter, so with rateLimit [1,1] and 2 proxies, you get 3 req/s total (1 direct + 2 proxies).
   * Proxy is called with query params: target=<encoded-url>, user_agent=<identity> and optional header X-Harmony-Secret.
   */
  proxyUrls?: string[]
  /**
   * Secret sent as X-Harmony-Secret when calling proxy URLs. Required if the worker checks env.AUTH_SECRET.
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
function buildRecordingQuery(
  params: SearchRecordingParams,
): string {
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
  // private readonly disableRateLimiting: boolean;

  constructor(proxyUrls: string[], rateLimit: [number, number], disableRateLimiting: boolean) {
    this.proxies = proxyUrls
    // this.disableRateLimiting = disableRateLimiting;
    this.rateLimiters = new Map()

    // Create a rate limiter for each proxy
    for (const proxyUrl of proxyUrls) {
      this.rateLimiters.set(
        proxyUrl,
        disableRateLimiting ? async () => {} : createRateLimiter(rateLimit[0], rateLimit[1])
      )
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

  /**
   * Get all proxies (for fallback retry logic).
   */
  getAllProxies(): string[] {
    return [...this.proxies]
  }
}

export class MusicBrainzApi {
  private readonly userAgent: string
  private readonly proxyAuthSecret: string | undefined
  private readonly waitForRateLimit: () => Promise<void>
  private readonly proxyManager: ProxyManager | null
  // private readonly useDirectConnection: boolean;

  constructor(options: MusicBrainzApiOptions) {
    const {
      appName,
      appVersion,
      appContactInfo,
      disableRateLimiting = false,
      rateLimit = [1, 1],
      proxyUrls = [],
      proxyAuthSecret,
    } = options
    this.proxyAuthSecret = proxyAuthSecret

    this.userAgent = `${appName}/${appVersion} ( ${appContactInfo} )`
    this.waitForRateLimit = disableRateLimiting
      ? async () => {}
      : createRateLimiter(rateLimit[0], rateLimit[1])

    // Initialize proxy manager if proxies are provided
    this.proxyManager =
      proxyUrls.length > 0 ? new ProxyManager(proxyUrls, rateLimit, disableRateLimiting) : null

    // Use direct connection if no proxies or as fallback
    // this.useDirectConnection = true;
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
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })
  }

  /**
   * Fetch directly (without proxy).
   */
  private async fetchDirect(url: string): Promise<Response> {
    await this.waitForRateLimit()

    return fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })
  }

  /**
   * Execute request with proxy fallback: uses next available proxy (round-robin), falls back to direct if proxy fails.
   */
  private async executeRequest(url: string): Promise<Response> {
    // If we have proxies, use the next one (round-robin)
    if (this.proxyManager) {
      const proxy = this.proxyManager.getNextProxy()
      if (proxy) {
        try {
          const response = await this.fetchViaProxy(proxy, url)
          if (response.ok) {
            return response
          }
          // If proxy returns non-OK, fallback to direct
        } catch (error) {
          // Proxy failed, fallback to direct
          console.warn(`Proxy ${proxy} failed, falling back to direct:`, error)
        }
      }
    }

    // Fallback to direct connection
    return this.fetchDirect(url)
  }

  /**
   * Search recordings by artist, recording title, and optionally release title.
   * GET /ws/2/recording?fmt=json&query=...&limit=...&offset=...&inc=...
   */
  async searchRecording(
    params: SearchRecordingParams,
    opts: SearchRecordingOptions = {},
  ): Promise<IRecordingList> {
    const { limit = 1, offset = 0 } = opts
    const query = buildRecordingQuery(params)
    const url = new URL(`${MB_BASE}/recording`)
    url.searchParams.set('fmt', 'json')
    url.searchParams.set('query', query)
    url.searchParams.set('limit', String(Math.min(100, Math.max(1, limit))))
    url.searchParams.set('offset', String(Math.max(0, offset)))
    // Include releases with media and tracks to get track numbers
    // Note: inc parameter may not always return full media details in search results
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
   * @param mbid - Artist UUID (e.g. "2baf3276-ed6a-4349-8d2e-f4601e7b2167")
   * @param inc - Optional include parameters (e.g. ["url-rels"] for URL relations)
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
   * @param mbid - Release UUID
   * @param inc - Optional include parameters (default: ["recordings", "media"])
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
   * Get the number of available proxies (for calculating optimal concurrency).
   * Returns 0 if no proxies are configured.
   */
  getProxyCount(): number {
    return this.proxyManager?.getAllProxies().length ?? 0
  }
}
