export interface TrendPoint {
  label: string
  value: number
}

export interface TopTrackDto {
  id: number
  name: string
  description: string
  image: string | null
  streams: number
  playtime: number
}

export interface TopTracksResponseDto {
  packageId: string
  tracks: TopTrackDto[]
}

export interface TrackMetadataDto {
  firstListenedAt: string | null
  lastListenedAt: string | null
  forwardSkips: number
  replays: number
  forwardSkipRate: number
  replayRate: number
}

export interface TrackDetailsDto {
  id: number
  name: string
  description: string
  image: string | null
  streams: number
  playtime: number
  trend: TrendPoint[]
  distribution: TrendPoint[]
  metadata: TrackMetadataDto
}
