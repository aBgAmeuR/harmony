/**
 * Rate limiter: at most `maxRequests` per window of `windowSeconds` seconds.
 */
export function createRateLimiter(maxRequests: number, windowSeconds: number): () => Promise<void> {
  const timestamps: number[] = []
  return async function waitIfNeeded(): Promise<void> {
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000
    while (timestamps.length > 0 && timestamps[0]! < windowStart) {
      timestamps.shift()
    }
    if (timestamps.length >= maxRequests) {
      const waitMs = timestamps[0]! + windowSeconds * 1000 - now
      if (waitMs > 0) {
        await new Promise((r) => setTimeout(r, waitMs))
        return waitIfNeeded()
      }
    }
    timestamps.push(now)
  }
}
