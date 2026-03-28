import { type SearchRecordingParams } from '@harmony/musicbrainz'
import { type MetadataSearchVariant } from '../metadata_search_variant.ts'
import { mbApi } from '../../../../lib/musicbrainz.ts'

export class WithoutAlbumVariant implements MetadataSearchVariant {
  canHandle() {
    return true
  }

  search(params: SearchRecordingParams) {
    return mbApi.recordings.search(
      { artist: params.artist, recording: params.recording },
      { limit: 5 }
    )
  }
}
