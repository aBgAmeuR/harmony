import type { SearchRecordingParams } from '@harmony/musicbrainz'
import { hasAmpersand, normalizeParamsAmpersand } from '../ampersand_utils.ts'
import { type MetadataSearchVariant } from '../metadata_search_variant.ts'
import { mbApi } from '../../../../lib/musicbrainz.ts'

export class AmpersandWithoutAlbumVariant implements MetadataSearchVariant {
  canHandle(params: SearchRecordingParams) {
    return hasAmpersand(params)
  }

  search(params: SearchRecordingParams) {
    const modifiedParams = normalizeParamsAmpersand(params)
    return mbApi.recordings.search(
      { artist: modifiedParams.artist, recording: modifiedParams.recording },
      { limit: 5 }
    )
  }
}
