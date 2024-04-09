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

export type TrackType = CleanDataType & {
  score: number
  image_url: string
}

export type GroupedArtistType = {
  total_played: number
  ms_played: number
  name: string
  spotify_track_uri: string
}

export type GroupedAlbumsType = {
  total_played: number
  ms_played: number
  name: string
  artist_name: string
  spotify_track_uri: string
}

export type AlbumType = {
  total_played: number
  ms_played: number
  name: string
  image_url: string
  artist_name: string
  href: string
  score: number
  spotify_album_uri: string
}

export type ArtistType = {
  total_played: number
  ms_played: number
  name: string
  image_url: string
  href: string
  score: number
  spotify_artist_uri: string
}

export type BasicUser = {
  id: string
  username: string
}

