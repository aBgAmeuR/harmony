export class ProxyPoolError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class NoProxyConfiguredError extends ProxyPoolError {
  constructor() {
    super('MusicBrainz v3: at least one proxy URL is required')
  }
}

export class ProxyRequestFailedError extends ProxyPoolError {
  readonly attempts: number
  readonly lastStatus: number | null
  readonly lastProxyUrl: string | null
  readonly lastErrorMessage: string | null

  constructor(params: {
    attempts: number
    lastStatus: number | null
    lastProxyUrl: string | null
    lastErrorMessage: string | null
  }) {
    const statusLabel = params.lastStatus === null ? 'unknown-status' : `status-${params.lastStatus}`
    const proxyLabel = params.lastProxyUrl ?? 'unknown-proxy'
    const errorLabel = params.lastErrorMessage ?? 'no-error-message'
    super(
      `MusicBrainz v3: request failed after ${params.attempts} attempts (${statusLabel}, ${proxyLabel}, ${errorLabel})`
    )

    this.attempts = params.attempts
    this.lastStatus = params.lastStatus
    this.lastProxyUrl = params.lastProxyUrl
    this.lastErrorMessage = params.lastErrorMessage
  }
}

export class MusicBrainzHttpStatusError extends ProxyPoolError {
  readonly status: number
  readonly body: string
  readonly url: string

  constructor(status: number, body: string, url: string) {
    super(`MusicBrainz v3: request to ${url} failed with status ${status}`)
    this.status = status
    this.body = body
    this.url = url
  }
}
