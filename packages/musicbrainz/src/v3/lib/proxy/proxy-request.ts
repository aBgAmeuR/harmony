import { HttpRequest } from '../http/http-request.js'

export class ProxyRequest {
  private readonly request: HttpRequest
  attempt = 1
  lastStatus: number | null = null
  lastProxyUrl: string | null = null
  lastErrorMessage: string | null = null
  createdAt = Date.now()

  constructor(request: HttpRequest) {
    this.request = request
  }

  async execute(proxyUrl: string) {
    this.lastProxyUrl = proxyUrl
    return this.request.execute(proxyUrl)
  }
}
