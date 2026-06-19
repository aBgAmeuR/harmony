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
  from: string
  to: string
}
