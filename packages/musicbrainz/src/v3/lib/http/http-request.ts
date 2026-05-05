export class HttpRequest {
  private readonly method: string
  private readonly url: string
  private readonly userAgent: string
  private readonly headers: Headers

  constructor(method: string, url: string, userAgent: string, headers: Headers) {
    this.method = method
    this.url = url
    this.userAgent = userAgent
    this.headers = headers
  }

  async execute(proxyUrl: string) {
    const params = new URLSearchParams({
      target: this.url,
      user_agent: this.userAgent,
    })

    const url = `${proxyUrl.replace(/\/?$/, '')}?${params.toString()}`

    return fetch(url, {
      method: this.method,
      headers: this.headers,
    })
  }
}
