import { MusicBrainzConfig } from './config.js'
import { MusicBrainzHttpStatusError, NoProxyConfiguredError } from './errors.js'
import { ProxyManager } from './proxy-manager.js'

export class HttpClient {
  private readonly proxyManager: ProxyManager
  private readonly userAgent: string

  constructor(private readonly config: MusicBrainzConfig) {
    if (config.proxyUrls.length === 0) {
      throw new NoProxyConfiguredError()
    }
    this.userAgent = `${config.appName}/${config.appVersion} ( ${config.appContactInfo} )`
    this.proxyManager = new ProxyManager(config.proxyUrls, {
      perProxyIntervalMs: 1000,
      attemptTimeoutMs: 8000,
      totalDeadlineMs: 20000,
      maxAttempts: 3,
      retryBaseDelayMs: 200,
      retryMaxDelayMs: 1000,
    })
  }

  /**
   * Builds the full URL with query parameters
   */
  private getURL(path: string, query?: Record<string, string>): string {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path
    const url = new URL(normalizedPath, 'https://musicbrainz.org/ws/2/')

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return url.toString()
  }

  /**
   * Main request method with error handling and retries
   */
  private async request<T>(path: string, query?: Record<string, string>): Promise<T> {
    const url = this.getURL(path, query)

    try {
      const response = await this.proxyManager.scheduleRequest((proxyUrl, signal) => {
        const params = new URLSearchParams()
        params.set('target', url)
        params.set('user_agent', this.userAgent)

        const finalUrl = `${proxyUrl.replace(/\/?$/, '')}?${params.toString()}`
        const headers: Record<string, string> = {
          Accept: 'application/json',
          'X-Harmony-Secret': this.config.proxyAuthSecret,
        }

        return fetch(finalUrl, {
          method: 'GET',
          headers,
          signal,
        })
      })

      if (response.ok) {
        return (await response.json()) as T
      }

      throw await this.handleError(response, url)
    } catch (error) {
      throw error
    }
  }

  /**
   * Error handler that creates specific error instances
   */
  private async handleError(response: Response, url: string): Promise<Error> {
    const body = await response.text().catch(() => '')
    return new MusicBrainzHttpStatusError(response.status, body, url)
  }

  /**
   * GET request
   */
  async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    return this.request<T>(path, query)
  }
}
