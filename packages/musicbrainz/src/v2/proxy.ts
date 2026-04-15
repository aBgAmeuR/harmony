export type ProxyCooldownStepMs = readonly [number, number, number]

export const DEFAULT_PROXY_COOLDOWN_STEPS_MS: ProxyCooldownStepMs = [5000, 15000, 30000]

export class ProxyState {
  readonly url: string
  nextAvailableAt = 0
  cooldownUntil = 0
  consecutiveFailures = 0
  successCount = 0
  failureCount = 0
  lastLatencyMs: number | null = null
  lastErrorAt: number | null = null

  constructor(url: string) {
    this.url = url
  }

  isReady(now: number): boolean {
    return now >= this.cooldownUntil && now >= this.nextAvailableAt
  }

  earliestReadyAt(): number {
    return Math.max(this.cooldownUntil, this.nextAvailableAt)
  }

  reserve(now: number, minIntervalMs: number): void {
    this.nextAvailableAt = Math.max(this.nextAvailableAt, now) + minIntervalMs
  }

  markSuccess(latencyMs: number): void {
    this.successCount += 1
    this.consecutiveFailures = 0
    this.lastLatencyMs = latencyMs
  }

  markFailure(now: number, cooldownStepsMs: ProxyCooldownStepMs): number {
    this.failureCount += 1
    this.consecutiveFailures += 1
    this.lastErrorAt = now

    const cooldownIndex = Math.min(this.consecutiveFailures - 1, cooldownStepsMs.length - 1)
    const cooldownMs = cooldownStepsMs[cooldownIndex] ?? cooldownStepsMs[cooldownStepsMs.length - 1]
    this.cooldownUntil = now + cooldownMs
    return cooldownMs
  }

  quarantineForMs(now: number, durationMs: number): void {
    this.lastErrorAt = now
    this.cooldownUntil = Math.max(this.cooldownUntil, now + durationMs)
  }
}
