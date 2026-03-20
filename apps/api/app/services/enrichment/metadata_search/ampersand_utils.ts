import { type SearchRecordingParams } from '@harmony/musicbrainz'

export const hasAmpersand = (params: SearchRecordingParams): boolean =>
  params.artist.includes('&') ||
  params.recording.includes('&') ||
  (params.release ? params.release.includes('&') : false)

export const normalizeParamsAmpersand = (params: SearchRecordingParams): SearchRecordingParams => ({
  artist: normalizeAmpersand(params.artist),
  recording: normalizeAmpersand(params.recording),
  release: params.release ? normalizeAmpersand(params.release) : undefined,
})

const normalizeAmpersand = (str: string): string => {
  if (!str) return ''
  return str.replace(/\s*&\s*/g, ' & ').trim()
}
