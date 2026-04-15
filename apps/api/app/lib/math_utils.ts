/**
 * Returns the ratio of count to total, rounded to 4 decimal places.
 * Returns 0 when total is 0 to avoid division by zero.
 */
export function shareOfTotal(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 10000) / 10000 : 0
}

/**
 * Normalises a raw DB timestamp value to an ISO 8601 string, or null.
 */
export function timestampToIso(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
