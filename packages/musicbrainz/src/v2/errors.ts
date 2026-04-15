export class ProxyPoolError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class NoProxyConfiguredError extends ProxyPoolError {
  constructor() {
    super('MusicBrainz v2: at least one proxy URL is required')
  }
}

export class RequestTimeoutError extends ProxyPoolError {
  readonly timeoutMs: number

  constructor(timeoutMs: number) {
    super(`MusicBrainz v2: request attempt timed out after ${timeoutMs}ms`)
    this.timeoutMs = timeoutMs
  }
}

export class ProxyPoolExhaustedError extends ProxyPoolError {
  readonly attempts: number

  constructor(attempts: number, causeMessage: string) {
    super(`MusicBrainz v2: request failed after ${attempts} attempts (${causeMessage})`)
    this.attempts = attempts
  }
}

export class QueueAbortedError extends ProxyPoolError {
  constructor() {
    super('MusicBrainz v2: request queue wait aborted')
  }
}

export class MusicBrainzHttpStatusError extends ProxyPoolError {
  readonly status: number
  readonly body: string
  readonly url: string

  constructor(status: number, body: string, url: string) {
    super(`MusicBrainz v2: request to ${url} failed with status ${status}`)
    this.status = status
    this.body = body
    this.url = url
  }
}
