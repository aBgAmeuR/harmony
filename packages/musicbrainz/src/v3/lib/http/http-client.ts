import { ApiConfig } from '../../interfaces/config.js'
import { MusicBrainzHttpStatusError } from '../proxy/errors.js'
import { ProxyManager } from '../proxy/proxy-manager.js'
import { HttpRequest } from './http-request.js'

export class HttpClient {
  private readonly config: ApiConfig
  private readonly proxyManager: ProxyManager
  protected readonly baseURL = 'https://musicbrainz.org/ws/2/'
  protected readonly userAgent: string

  constructor(config: ApiConfig) {
    this.config = config

    this.userAgent = `${config.app.name}/${config.app.version} ( ${config.app.contactInfo} )`
    this.proxyManager = new ProxyManager(config.proxyUrls)
  }

  private getURL(path: string, query?: Record<string, string>) {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path
    const url = new URL(normalizedPath, this.baseURL)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return url.toString()
  }

  private async request<T>(path: string, query?: Record<string, string>) {
    const url = this.getURL(path, query)
    const headers = new Headers({
      'Accept': 'application/json',
      'X-Harmony-Secret': this.config.proxyAuthSecret,
    })

    const request = new HttpRequest('GET', url, this.userAgent, headers)

    const response = await this.proxyManager.schedule(request)
    if (response.ok) {
      return (await response.json()) as T
    }

    throw await this.handleError(response, url)
  }

  private async handleError(response: Response, url: string) {
    const body = await response.text().catch(() => '')
    return new MusicBrainzHttpStatusError(response.status, body, url)
  }

  async get<T>(path: string, query?: Record<string, string>) {
    return this.request<T>(path, query)
  }
}
