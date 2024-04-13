export type DataResults = {
  user: BasicUser
  songs: SongsData
}

export type SongsData = {
  [key in TimeRange]: {
    tracks: Track[]
    artists: Artist[]
    albums: Album[]
  }
}

export type TimeRange = "long_term" | "medium_term" | "short_term"
