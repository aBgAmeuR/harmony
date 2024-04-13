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

export type TrackType = Omit<CleanDataType, "spotify_track_uri"> & {
  score: number
  image_url: string
  href: string
  spotify_uri: string
}

export type AlbumType = {
  total_played: number
  ms_played: number
  name: string
  image_url: string
  artist_name: string
  href: string
  score: number
  spotify_uri: string
}

export type ArtistType = {
  total_played: number
  ms_played: number
  name: string
  image_url: string
  href: string
  score: number
  spotify_uri: string
}

export type BasicUser = {
  id: string
  username: string
  image_url: string
  href: string
}

export type ArtistDetailsType = ArtistType & {
  albums: {
    total_played: number
    ms_played: number
    name: string
    score: number
  }[]
  tracks: {
    total_played: number
    ms_played: number
    name: string
    score: number
  }[]
}

export type AlbumDetailsType = AlbumType & {
  tracks: {
    total_played: number
    ms_played: number
    name: string
    score: number
  }[]
}

export type TrackDetailsType = {
  total_played: number
  ms_played: number
  name: string
  spotify_uri: string
  score: number
  image_url: string
  href: string
  artist: {
    total_played: number
    ms_played: number
    name: string
    score: number
  }
  album: {
    total_played: number
    ms_played: number
    name: string
    score: number
  }
}

export interface DataResults {
  user: BasicUser
  ranking: RankingData
  details: DetailedData
}

export interface RankingData {
  tracks_Ranking_alltime: TrackType[]
  tracks_Ranking_1year: TrackType[]
  tracks_Ranking_6months: TrackType[]
  artists_Ranking_alltime: ArtistType[]
  artists_Ranking_1year: ArtistType[]
  artists_Ranking_6months: ArtistType[]
  albums_Ranking_alltime: AlbumType[]
  albums_Ranking_1year: AlbumType[]
  albums_Ranking_6months: AlbumType[]
}

export interface DetailedData {
  artists_Details_6months: ArtistDetailsType[]
  artists_Details_1year: ArtistDetailsType[]
  artists_Details_alltime: ArtistDetailsType[]
  albums_Details_6months: AlbumDetailsType[]
  albums_Details_1year: AlbumDetailsType[]
  albums_Details_alltime: AlbumDetailsType[]
  tracks_Details_6months: TrackDetailsType[]
  tracks_Details_1year: TrackDetailsType[]
  tracks_Details_alltime: TrackDetailsType[]
}

export type TimeRange = "6months" | "1year" | "alltime"
export type EntityType = "artists" | "albums" | "tracks"
export type TablesType = "Details" | "Ranking"
