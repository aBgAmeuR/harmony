export type DataResults = {
  user: BasicUser
  songs: SongsData
  stats: StatsData
}

export type TimeRange = "long_term" | "medium_term" | "short_term"

export type SongsData = {
  [key in TimeRange]: {
    tracks: Track[]
    artists: Artist[]
    albums: Album[]
  }
}

export type StatsData = {
  [key in TimeRange]: {
    total_streams: number
    total_ms_played: number
    total_tracks: number
    total_artists: number
    total_albums: number
    hourly_distribution: ChartData
    monthly_distribution: ChartData
    average_daily_streams: number
    average_daily_ms_played: number
  }
}

