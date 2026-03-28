import type { SearchRecordingParams } from '../options.js'

/**
 * Builds a Lucene-style query string for recording search.
 * Escapes double quotes in values.
 */
export function buildRecordingQuery(params: SearchRecordingParams): string {
  const escape = (s: string) => s.replace(/"/g, '\\"')
  const parts = [`artist:"${escape(params.artist)}"`, `recording:"${escape(params.recording)}"`]
  if (params.release) {
    parts.push(`release:"${escape(params.release)}"`)
  }
  return parts.join(' AND ')
}
