export type DataType = {
  ts: string
  username: string
  platform: string
  ms_played: number
  conn_country: string
  ip_addr_decrypted: string
  user_agent_decrypted: string
  master_metadata_track_name: string
  master_metadata_album_artist_name: string
  master_metadata_album_album_name: string
  spotify_track_uri: string
  episode_name: string
  episode_show_name: string
  spotify_episode_uri: string
  reason_start: string
  reason_end: string
  shuffle: boolean | null
  skipped: boolean | null
  offline: boolean | null
  offline_timestamp: number
  incognito_mode: boolean | null
}

export type CleanDataType = {
  total_played: number
  ms_played: number
  track_name: string
  artist_name: string
  album_name: string
  spotify_track_uri: string
}

export type CleanDataTypeWithScore = CleanDataType & {
  score: number
}

export type TrackType = CleanDataTypeWithScore & {
  image_url: string
}

export type BasicUser = {
  id: string
  username: string
}

export type ExtendedUser = BasicUser & {
  allTimeTracks: TrackType[]
  last6MonthsTracks: TrackType[]
  lastYearTracks: TrackType[]
}

export type User = BasicUser | ExtendedUser
