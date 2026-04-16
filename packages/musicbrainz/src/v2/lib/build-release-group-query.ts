import type { SearchReleaseParams } from '../../options.js'

const RELEASE_SEARCH_STATUS_OFFICIAL = 'Official' as const

function escapeLucene(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function buildReleaseGroupQuery(params: SearchReleaseParams, withQuotes: boolean = true): string {
  const quote = (value: string): string => (withQuotes ? `"${escapeLucene(value)}"` : escapeLucene(value))

  return [
    `artist:${quote(params.artist)}`,
    `release:${quote(params.release)}`,
    `status:${quote(RELEASE_SEARCH_STATUS_OFFICIAL)}`,
  ].join(' AND ')
}
