import { AlbumType, ArtistType, BasicUser, TrackType } from "@/lib/files/data"

type StoreData = {
  user: BasicUser
  allTimeTracks: TrackType[]
  lastYearTracks: TrackType[]
  last6MonthsTracks: TrackType[]
  allTimeArtists: ArtistType[]
  lastYearArtists: ArtistType[]
  last6MonthsArtists: ArtistType[]
  allTimeAlbums: AlbumType[]
  lastYearAlbums: AlbumType[]
  last6MonthsAlbums: AlbumType[]
}

// Cookies
export const storeData = (data: StoreData) => {
  localStorage.clear()
  localStorage.setItem("store", JSON.stringify(data))
}
