import type { SearchReleaseParams } from '../options.js'

/** @see https://musicbrainz.org/doc/Release#Status */
export const RELEASE_SEARCH_STATUS_OFFICIAL = 'Official' as const

/**
 * Lucene query for {@link https://musicbrainz.org/doc/MusicBrainz_API/Search/ReleaseGroupSearch Release group search}.
 * The release-group index has no `format` field (unlike release search); use `inc=releases` and filter mediums if needed.
 */
export function buildReleaseGroupQuery(params: SearchReleaseParams, withQuotes: boolean = true): string {
  const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const quote = (val: string) => withQuotes ? `"${escape(val)}"` : escape(val);

  return [
    `artist:${quote(params.artist)}`,
    `release:${quote(params.release)}`,
    `status:${quote(RELEASE_SEARCH_STATUS_OFFICIAL)}`
  ].join(' AND ');
}
