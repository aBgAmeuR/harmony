/**
 * Converts milliseconds to minutes, rounded to one decimal place.
 */
export function msToMinutes(ms: number): number {
  return Math.round((ms / 60000) * 10) / 10
}
