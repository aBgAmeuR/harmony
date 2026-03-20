import type { IRecordingList } from '@harmony/musicbrainz'
import type { SearchRecordingParams } from '@harmony/musicbrainz'

export type MetadataSearchResult = {
  metadata: IRecordingList
}

export type MetadataSearchVariant = {
  canHandle: (params: SearchRecordingParams) => boolean
  search: (params: SearchRecordingParams) => Promise<IRecordingList>
}
