export { MusicBrainzClient } from './musicbrainz-client.js'
export type {
  MusicBrainzClientOptions,
  SearchRecordingParams,
  SearchRecordingOptions,
  SearchReleaseParams,
  SearchReleaseOptions,
  ArtistInclude,
  ReleaseInclude,
} from './options.js'
export { RELEASE_LOOKUP_DEFAULT_INC } from './options.js'
export { MusicBrainzApiError } from './errors.js'
export { MusicBrainzApi as MusicBrainzApiV2 } from './v2/musicbrainz-api.js'
export type { MusicBrainzConfig as MusicBrainzV2Config } from './v2/config.js'
export {
  ProxyPoolError,
  NoProxyConfiguredError,
  RequestTimeoutError,
  ProxyPoolExhaustedError,
  QueueAbortedError,
  MusicBrainzHttpStatusError,
} from './v2/errors.js'
export type {
  IRecordingList,
  IRecordingMatch,
  IRecording,
  IArtist,
  IRelease,
  IReleaseList,
  IReleaseMatch,
  IReleaseGroup,
  IReleaseGroupList,
  IReleaseGroupMatch,
  ISearchResult,
  IMedium,
  IArtistCredit,
  CaaImage,
  CaaIndexJson,
  CaaThumbnails,
} from './types/index.js'

export { MusicBrainzApi as MusicBrainzApiV3 } from './v3/lib/musicbrainz-api.js'