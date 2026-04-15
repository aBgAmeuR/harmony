export type Catalog = {
  id: number
  name: string
  description: string
  image: string | null
  streams: number
  playtime: number
}

export type CatalogDetails = Catalog & {
  trend: Array<{ label: string; value: number }>
  distribution: Array<{ label: string; value: number }>
  metadata: {
    firstListenedAt: string | null
    lastListenedAt: string | null
    forwardSkips: number
    replays: number
    forwardSkipRate: number
    replayRate: number
  }
}
