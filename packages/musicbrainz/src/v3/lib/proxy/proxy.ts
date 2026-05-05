const MIN_PROXY_START_INTERVAL_MS = 1100
const FIRST_RATE_LIMIT_COOLDOWN_MS = 5000
const SECOND_RATE_LIMIT_COOLDOWN_MS = 15000
const THIRD_RATE_LIMIT_COOLDOWN_MS = 30000

export class Proxy {
  private readonly url: string
  nextAvailableAt = 0
  cooldownUntil = 0
  consecutiveFailures = 0
  successCount = 0
  failureCount = 0
  activeRequests = 0

  constructor(url: string) {
    this.url = url
  }

  getURL() {
    return this.url
  }

  isReady(now: number) {
    return this.activeRequests === 0 && now >= this.nextAvailableAt && now >= this.cooldownUntil
  }

  earliestReadyAt() {
    return Math.max(this.nextAvailableAt, this.cooldownUntil)
  }

  reserve(now: number) {
    this.activeRequests += 1
    this.nextAvailableAt = Math.max(this.nextAvailableAt, now) + MIN_PROXY_START_INTERVAL_MS
  }

  completeRequest() {
    this.activeRequests = Math.max(0, this.activeRequests - 1)
  }

  markSuccess() {
    this.successCount += 1
    this.consecutiveFailures = 0
  }

  mark503Failure(now: number) {
    this.failureCount += 1
    this.consecutiveFailures += 1

    const cooldownMs =
      this.consecutiveFailures === 1
        ? FIRST_RATE_LIMIT_COOLDOWN_MS
        : this.consecutiveFailures === 2
          ? SECOND_RATE_LIMIT_COOLDOWN_MS
          : THIRD_RATE_LIMIT_COOLDOWN_MS

    this.cooldownUntil = Math.max(this.cooldownUntil, now + cooldownMs)
    console.log(`Proxy ${this.url} 503, cooldown until ${cooldownMs}`)
    return cooldownMs
  }
}
