import { MusicBrainzApiError } from '../errors.js'
import { ProxyManager } from '../lib/proxy-manager.js'

/**
 * All MusicBrainz `ws/2` traffic goes through configured proxies only (no direct MB).
 * @see https://musicbrainz.org/doc/MusicBrainz_API
 */
export class MusicBrainzHttpClient {
  private readonly proxyManager: ProxyManager | null

  constructor(
    private readonly userAgent: string,
    private readonly proxyAuthSecret: string | undefined,
    proxyUrls: string[],
    rateLimit: [number, number]
  ) {
    this.proxyManager = proxyUrls.length > 0 ? new ProxyManager(proxyUrls, rateLimit) : null
  }

  getProxyCount(): number {
    return this.proxyManager?.getAllProxies().length ?? 0
  }

  /**
   * GET JSON from `ws/2`. One attempt via round-robin proxy. No direct MB, no retry on other proxies.
   */
  async getJson<T>(url: URL): Promise<T> {
    const res = await this.executeRequest(url.toString())
    const body = await res.text()
    if (!res.ok) {
      throw new MusicBrainzApiError(res.status, body)
    }
    return JSON.parse(body) as T
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
}
