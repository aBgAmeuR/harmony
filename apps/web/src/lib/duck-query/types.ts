export type DuckCatalogRow = {
  id: number
  name: string
  description: string
  image: string
  streams: number
  playtime: number
}

export type TopCatalogInput = {
  size: number
  from?: string
  to?: string
}

export type DateRangeInput = {
  from?: string
  to?: string
}

export type ListeningHabitTrendPoint = {
  label: string
  value: number
}

export type ListeningHabitHeatmapColumn = {
  bin: number
  bins: Array<{
    count: number
    bin: number
    date: Date
  }>
}

export type ListeningHabitMetric = {
  value: number
  trend: Array<ListeningHabitTrendPoint>
  heatmap?: Array<ListeningHabitHeatmapColumn>
  heatmapMinutesByDate?: Record<string, number>
}
