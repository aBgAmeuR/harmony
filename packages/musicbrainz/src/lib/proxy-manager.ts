import { createRateLimiter } from './rate-limiter.js'

/**
 * Rotates through proxies and applies rate limiting per proxy URL.
 */
export class ProxyManager {
  private readonly proxies: string[]
  private readonly rateLimiters: Map<string, () => Promise<void>>
  private currentIndex = 0

  constructor(proxyUrls: string[], rateLimit: [number, number]) {
    this.proxies = proxyUrls
    this.rateLimiters = new Map()

    for (const proxyUrl of proxyUrls) {
      this.rateLimiters.set(proxyUrl, createRateLimiter(rateLimit[0], rateLimit[1]))
    }
  }

  getNextProxy(): string | null {
    if (this.proxies.length === 0) return null
    const proxy = this.proxies[this.currentIndex % this.proxies.length]
    this.currentIndex++
    return proxy ?? null
  }

  async waitForProxy(proxyUrl: string): Promise<void> {
    const limiter = this.rateLimiters.get(proxyUrl)
    if (limiter) await limiter()
  }

  getAllProxies(): string[] {
    return [...this.proxies]
  }
}
