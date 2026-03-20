export type RetryWithBackoffOptions = {
  maxAttempts?: number
  initialMs?: number
  maxMs?: number
  backoffMultiplier?: number
}

const DEFAULT_OPTIONS: Required<RetryWithBackoffOptions> = {
  maxAttempts: 3,
  initialMs: 1000,
  maxMs: 10_000,
  backoffMultiplier: 2,
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryWithBackoffOptions = {}
): Promise<T> {
  const { maxAttempts, initialMs, maxMs, backoffMultiplier } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }
  let lastError: unknown
  let delay = initialMs

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === maxAttempts) throw err
      await new Promise((r) => setTimeout(r, delay))
      delay = Math.min(delay * backoffMultiplier, maxMs)
    }
  }

  throw lastError
}
