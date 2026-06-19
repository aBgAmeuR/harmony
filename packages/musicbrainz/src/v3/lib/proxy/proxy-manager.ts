import { HttpRequest } from '../http/http-request.js'
import { NoProxyConfiguredError, ProxyRequestFailedError } from './errors.js'
import { ProxyRequest } from './proxy-request.js'
import { Proxy } from './proxy.js'

const MAX_ATTEMPTS_TOTAL = 3

type QueueTask = {
  request: ProxyRequest
  resolve: (response: Response) => void
  reject: (reason: unknown) => void
}

export class ProxyManager {
  private readonly proxies: Proxy[]
  private readonly queue: QueueTask[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private pumping = false
  private pendingPump = false
  private nextProxyIndex = 0

  constructor(proxyUrls: string[]) {
    if (proxyUrls.length === 0) {
      throw new NoProxyConfiguredError()
    }
    this.proxies = proxyUrls.map((url) => new Proxy(url))
  }

  schedule(httpRequest: HttpRequest) {
    const task: QueueTask = {
      request: new ProxyRequest(httpRequest),
      resolve: () => undefined,
      reject: () => undefined,
    }

    return new Promise<Response>((resolve, reject) => {
      task.resolve = resolve
      task.reject = reject
      this.queue.push(task)
      this.pump()
    })
  }

  private clearTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private scheduleNextPump(waitMs: number) {
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.timer = null
      this.pump()
    }, waitMs)
  }

  private selectReadyProxy(now: number) {
    const total = this.proxies.length
    for (let offset = 0; offset < total; offset += 1) {
      const index = (this.nextProxyIndex + offset) % total
      const proxy = this.proxies[index]
      if (proxy && proxy.isReady(now)) {
        this.nextProxyIndex = (index + 1) % total
        return proxy
      }
    }
    return null
  }

  private getEarliestNonBusyReadyAt() {
    let earliest = Number.POSITIVE_INFINITY
    for (const proxy of this.proxies) {
      if (proxy.activeRequests > 0) {
        continue
      }
      const readyAt = proxy.earliestReadyAt()
      if (readyAt < earliest) {
        earliest = readyAt
      }
    }
    if (!Number.isFinite(earliest)) {
      return null
    }
    return earliest
  }

  private shouldRetryResponse(response: Response) {
    return response.status >= 500
  }

  private failTask(task: QueueTask) {
    task.reject(
      new ProxyRequestFailedError({
        attempts: task.request.attempt,
        lastStatus: task.request.lastStatus,
        lastProxyUrl: task.request.lastProxyUrl,
        lastErrorMessage: task.request.lastErrorMessage,
      })
    )
  }

  private requeue(task: QueueTask) {
    task.request.attempt += 1
    this.queue.push(task)
  }

  private pump() {
    if (this.pumping) {
      this.pendingPump = true
      return
    }
    this.pumping = true

    try {
      while (this.queue.length > 0) {
        const now = Date.now()
        const proxy = this.selectReadyProxy(now)
        if (!proxy) {
          const earliest = this.getEarliestNonBusyReadyAt()
          if (earliest) {
            const waitMs = Math.max(1, earliest - now)
            this.scheduleNextPump(waitMs)
          }
          return
        }

        const task = this.queue.shift()
        if (!task) {
          return
        }

        proxy.reserve(now)
        const proxyUrl = proxy.getURL()

        void task.request
          .execute(proxyUrl)
          .then((response) => {
            task.request.lastStatus = response.status
            task.request.lastErrorMessage = null

            if (response.ok) {
              proxy.markSuccess()
              task.resolve(response)
              return
            }

            if (response.status === 503) {
              proxy.mark503Failure(Date.now())
            }

            if (response.status >= 400 && response.status < 500) {
              task.resolve(response)
              return
            }

            if (task.request.attempt >= MAX_ATTEMPTS_TOTAL || !this.shouldRetryResponse(response)) {
              this.failTask(task)
              return
            }

            this.requeue(task)
          })
          .catch((error: unknown) => {
            task.request.lastStatus = null
            task.request.lastErrorMessage = error instanceof Error ? error.message : String(error)

            if (task.request.attempt >= MAX_ATTEMPTS_TOTAL) {
              this.failTask(task)
              return
            }

            this.requeue(task)
          })
          .finally(() => {
            proxy.completeRequest()
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
