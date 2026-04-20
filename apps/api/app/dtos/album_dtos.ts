export interface TopAlbumDto {
  id: number
  name: string
  description: string
  image: string | null
  streams: number
  playtime: number
}

export interface TopAlbumsResponseDto {
  packageId: string
  albums: TopAlbumDto[]
}
