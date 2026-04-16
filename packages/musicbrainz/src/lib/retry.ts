const DEFAULT_DELAYS_MS: readonly number[] = [1000, 2000, 5000]

export interface WithRetryOptions {
  /** Milliseconds to wait after each failed attempt before the next try. Default: 1s, 2s, 5s (3 retries). */
  readonly delaysMs?: readonly number[]
  readonly shouldRetry?: (error: unknown) => boolean
}

/**
 * Runs `fn` once, then on failure retries up to `delaysMs.length` times, waiting after each failure.
 */
export async function withRetry<T>(fn: () => Promise<T>, options?: WithRetryOptions): Promise<T> {
  const delaysMs = options?.delaysMs ?? DEFAULT_DELAYS_MS
  const shouldRetry = options?.shouldRetry ?? (() => true)

  let lastError: unknown
  for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === delaysMs.length || !shouldRetry(error)) {
        throw error
      }
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delaysMs[attempt]!)
      })
    }
  }
  throw lastError
}
