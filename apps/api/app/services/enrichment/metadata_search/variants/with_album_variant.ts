import { type SearchRecordingParams } from '@harmony/musicbrainz'
import { type MetadataSearchVariant } from '../metadata_search_variant.ts'
import { mbApi } from '../../../../lib/musicbrainz.ts'

export class WithAlbumVariant implements MetadataSearchVariant {
  canHandle() {
    return true
  }

  search(params: SearchRecordingParams) {
    return mbApi.searchRecording(params, { limit: 5 })
  }
}
