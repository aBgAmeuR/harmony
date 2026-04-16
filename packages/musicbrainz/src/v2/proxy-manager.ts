import { NoProxyConfiguredError, ProxyPoolExhaustedError, QueueAbortedError, RequestTimeoutError } from './errors.js'
import { DEFAULT_PROXY_COOLDOWN_STEPS_MS, ProxyCooldownStepMs, ProxyState } from './proxy.js'

type QueuePriority = 'normal' | 'retry'

type QueueTask<T> = {
  resolve: (value: T) => void
  reject: (reason: unknown) => void
  run: (proxy: ProxyState, signal: AbortSignal) => Promise<T>
  attempt: number
  deadlineAt: number
  priority: QueuePriority
  aborted: boolean
}

export type ProxyManagerConfig = {
  perProxyIntervalMs: number
  attemptTimeoutMs: number
  totalDeadlineMs: number
  maxAttempts: number
  retryBaseDelayMs: number
  retryMaxDelayMs: number
  cooldownStepsMs: ProxyCooldownStepMs
}

const PROXY_RATE_LIMIT_QUARANTINE_MS = 5000

const DEFAULT_CONFIG: ProxyManagerConfig = {
  perProxyIntervalMs: 1000,
  attemptTimeoutMs: 8000,
  totalDeadlineMs: 20000,
  maxAttempts: 3,
  retryBaseDelayMs: 200,
  retryMaxDelayMs: 1000,
  cooldownStepsMs: DEFAULT_PROXY_COOLDOWN_STEPS_MS,
}

export type ProxyPoolStats = {
  queueSize: number
  retryQueueSize: number
  proxies: Array<{
    url: string
    nextAvailableAt: number
    cooldownUntil: number
    consecutiveFailures: number
    successCount: number
    failureCount: number
    lastLatencyMs: number | null
    lastErrorAt: number | null
  }>
}

export class ProxyManager {
  private readonly proxies: ProxyState[]
  private readonly config: ProxyManagerConfig
  private readonly normalQueue: Array<QueueTask<Response>> = []
  private readonly retryQueue: Array<QueueTask<Response>> = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private pumping = false
  private pendingPump = false

  constructor(proxyUrls: string[], config?: Partial<ProxyManagerConfig>) {
    if (proxyUrls.length === 0) {
      throw new NoProxyConfiguredError()
    }
    this.proxies = proxyUrls.map((url) => new ProxyState(url))
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      cooldownStepsMs: config?.cooldownStepsMs ?? DEFAULT_CONFIG.cooldownStepsMs,
    }
  }

  scheduleRequest(
    run: (proxyUrl: string, signal: AbortSignal) => Promise<Response>,
    priority: QueuePriority = 'normal'
  ): Promise<Response> {
    const now = Date.now()
    const task: QueueTask<Response> = {
      run: async (proxy, signal) => run(proxy.url, signal),
      resolve: () => undefined,
      reject: () => undefined,
      attempt: 1,
      deadlineAt: now + this.config.totalDeadlineMs,
      priority,
      aborted: false,
    }

    return new Promise<Response>((resolve, reject) => {
      task.resolve = resolve
      task.reject = reject
      this.enqueue(task)
    })
  }

  getStats(): ProxyPoolStats {
    return {
      queueSize: this.normalQueue.length,
      retryQueueSize: this.retryQueue.length,
      proxies: this.proxies.map((proxy) => ({
        url: proxy.url,
        nextAvailableAt: proxy.nextAvailableAt,
        cooldownUntil: proxy.cooldownUntil,
        consecutiveFailures: proxy.consecutiveFailures,
        successCount: proxy.successCount,
        failureCount: proxy.failureCount,
        lastLatencyMs: proxy.lastLatencyMs,
        lastErrorAt: proxy.lastErrorAt,
      })),
    }
  }

  private enqueue(task: QueueTask<Response>): void {
    if (task.priority === 'retry') {
      this.retryQueue.push(task)
    } else {
      this.normalQueue.push(task)
    }
    this.pump()
  }

  private dequeue(): QueueTask<Response> | undefined {
    return this.retryQueue.shift() ?? this.normalQueue.shift()
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private scheduleNextPump(waitMs: number): void {
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.timer = null
      this.pump()
    }, waitMs)
  }

  private selectReadyProxy(now: number): ProxyState | null {
    let selected: ProxyState | null = null
    for (const proxy of this.proxies) {
      if (!proxy.isReady(now)) {
        continue
      }
      if (!selected) {
        selected = proxy
        continue
      }
      if (proxy.nextAvailableAt < selected.nextAvailableAt) {
        selected = proxy
        continue
      }
      if (
        proxy.nextAvailableAt === selected.nextAvailableAt &&
        proxy.consecutiveFailures < selected.consecutiveFailures
      ) {
        selected = proxy
      }
    }
    return selected
  }

  private getEarliestProxyReadyAt(): number {
    let earliest = Number.POSITIVE_INFINITY
    for (const proxy of this.proxies) {
      const readyAt = proxy.earliestReadyAt()
      if (readyAt < earliest) {
        earliest = readyAt
      }
    }
    return earliest
  }

  private computeBackoffMs(attempt: number): number {
    const expDelay = this.config.retryBaseDelayMs * 2 ** Math.max(0, attempt - 2)
    const bounded = Math.min(expDelay, this.config.retryMaxDelayMs)
    const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(bounded * 0.25)))
    return bounded + jitter
  }

  private canRetryResponse(response: Response): boolean {
    return response.status >= 500
  }

  private schedulePoolRetry(task: QueueTask<Response>): void {
    const nextAttempt = task.attempt + 1
    const retryDelay = this.computeBackoffMs(nextAttempt)
    const retryTask: QueueTask<Response> = {
      ...task,
      attempt: nextAttempt,
      priority: 'retry',
    }
    setTimeout(() => this.enqueue(retryTask), retryDelay)
  }

  private async executeWithTimeout(
    run: (proxy: ProxyState, signal: AbortSignal) => Promise<Response>,
    proxy: ProxyState
  ): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.attemptTimeoutMs)
    try {
      return await run(proxy, controller.signal)
    } catch (error) {
      if (controller.signal.aborted) {
        throw new RequestTimeoutError(this.config.attemptTimeoutMs)
      }
      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  private pump(): void {
    if (this.pumping) {
      this.pendingPump = true
      return
    }
    this.pumping = true

    try {
      while (this.retryQueue.length > 0 || this.normalQueue.length > 0) {
        const now = Date.now()
        const proxy = this.selectReadyProxy(now)

        if (!proxy) {
          const earliest = this.getEarliestProxyReadyAt()
          const waitMs = Math.max(1, earliest - now)
          this.scheduleNextPump(waitMs)
          return
        }

        const task = this.dequeue()
        if (!task) {
          return
        }
        if (task.aborted) {
          task.reject(new QueueAbortedError())
          continue
        }
        if (now > task.deadlineAt) {
          task.reject(new ProxyPoolExhaustedError(task.attempt - 1, 'deadline exceeded'))
          continue
        }

        proxy.reserve(now, this.config.perProxyIntervalMs)
        const startedAt = Date.now()
        void this.executeWithTimeout(task.run, proxy)
          .then((response) => {
            const latencyMs = Date.now() - startedAt
            const now = Date.now()

            if (response.ok) {
              proxy.markSuccess(latencyMs)
              task.resolve(response)
              return
            }

            if (response.status === 503) {
              proxy.quarantineForMs(now, PROXY_RATE_LIMIT_QUARANTINE_MS)
              if (task.attempt >= this.config.maxAttempts || !this.canRetryResponse(response)) {
                task.resolve(response)
                return
              }
              this.schedulePoolRetry(task)
              return
            }

            if (response.status >= 400 && response.status < 500) {
              proxy.markSuccess(latencyMs)
              task.resolve(response)
              return
            }

            proxy.markFailure(now, this.config.cooldownStepsMs)
            if (task.attempt >= this.config.maxAttempts || !this.canRetryResponse(response)) {
              task.resolve(response)
              return
            }

            this.schedulePoolRetry(task)
          })
          .catch((error: unknown) => {
            proxy.markFailure(Date.now(), this.config.cooldownStepsMs)
            if (task.attempt >= this.config.maxAttempts) {
              const message = error instanceof Error ? error.message : 'unknown transport error'
              task.reject(new ProxyPoolExhaustedError(task.attempt, message))
              return
            }

            this.schedulePoolRetry(task)
          })
          .finally(() => {
            this.pump()
          })
      }
    } finally {
      this.pumping = false
      if (this.pendingPump) {
        this.pendingPump = false
        queueMicrotask(() => this.pump())
      }
    }
  }
}
