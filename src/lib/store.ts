"use client"

import {
  AlbumDetailsType,
  AlbumType,
  ArtistDetailsType,
  ArtistType,
  BasicUser,
  TrackDetailsType,
  TrackType,
} from "@/lib/files/data"

type StoreRanking = {
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

type StoreDetails = {
  artistsDetails_6months: ArtistDetailsType[]
  artistsDetails_year: ArtistDetailsType[]
  artistsDetails_all: ArtistDetailsType[]
  albumsDetails_6months: AlbumDetailsType[]
  albumsDetails_year: AlbumDetailsType[]
  albumsDetails_all: AlbumDetailsType[]
  tracksDetails_6months: TrackDetailsType[]
  tracksDetails_year: TrackDetailsType[]
  tracksDetails_all: TrackDetailsType[]
}

type StoreData = {
  user: BasicUser
  ranking: StoreRanking
  details: StoreDetails
}

export const storeData = ({ user, ranking, details }: StoreData) => {
  localStorage.clear()
  localStorage.setItem("user", JSON.stringify(user))
  localStorage.setItem("ranking", JSON.stringify(ranking))
  localStorage.setItem("details", JSON.stringify(details))
}

export const getTracks = (timeframe: "alltime" | "1year" | "6months") => {
  if (typeof window === "undefined") return []
  const store = JSON.parse(
    localStorage.getItem("ranking") || "[]"
  ) as StoreRanking
  switch (timeframe) {
    case "alltime":
      return store.allTimeTracks
    case "1year":
      return store.lastYearTracks
    case "6months":
      return store.last6MonthsTracks
    default:
      return store.allTimeTracks
  }
}

export const getArtists = (timeframe: "alltime" | "1year" | "6months") => {
  if (typeof window === "undefined") return []
  const store = JSON.parse(
    localStorage.getItem("ranking") || "[]"
  ) as StoreRanking
  switch (timeframe) {
    case "alltime":
      return store.allTimeArtists
    case "1year":
      return store.lastYearArtists
    case "6months":
      return store.last6MonthsArtists
    default:
      return store.allTimeArtists
  }
}

export const getAlbums = (timeframe: "alltime" | "1year" | "6months") => {
  if (typeof window === "undefined") return []
  const store = JSON.parse(
    localStorage.getItem("ranking") || "[]"
  ) as StoreRanking
  switch (timeframe) {
    case "alltime":
      return store.allTimeAlbums
    case "1year":
      return store.lastYearAlbums
    case "6months":
      return store.last6MonthsAlbums
    default:
      return store.allTimeAlbums
  }
}

export const getArtistDetails = (
  timeframe: "alltime" | "1year" | "6months",
  artistId: string
) => {
  if (typeof window === "undefined") return null
  const store = JSON.parse(
    localStorage.getItem("details") || "[]"
  ) as StoreDetails

  const findArtist = (artists: ArtistDetailsType[]) => {
    return artists.find((artist) =>
      artist.spotify_artist_uri.includes(artistId)
    )
  }

  switch (timeframe) {
    case "alltime":
      return findArtist(store.artistsDetails_all) || null
    case "1year":
      return findArtist(store.artistsDetails_year) || null
    case "6months":
      return findArtist(store.artistsDetails_6months) || null
    default:
      return null
  }
}

export const getAlbumDetails = (
  timeframe: "alltime" | "1year" | "6months",
  albumId: string
) => {
  if (typeof window === "undefined") return null
  const store = JSON.parse(
    localStorage.getItem("details") || "[]"
  ) as StoreDetails

  const findAlbum = (albums: AlbumDetailsType[]) => {
    return albums.find((album) => album.spotify_album_uri.includes(albumId))
  }

  switch (timeframe) {
    case "alltime":
      return findAlbum(store.albumsDetails_all) || null
    case "1year":
      return findAlbum(store.albumsDetails_year) || null
    case "6months":
      return findAlbum(store.albumsDetails_6months) || null
    default:
      return null
  }
}

export const getTrackDetails = (
  timeframe: "alltime" | "1year" | "6months",
  trackId: string
) => {
  if (typeof window === "undefined") return null
  const store = JSON.parse(
    localStorage.getItem("details") || "[]"
  ) as StoreDetails

  const findTrack = (tracks: TrackDetailsType[]) => {
    return tracks.find((track) => track.spotify_track_uri.includes(trackId))
  }

  switch (timeframe) {
    case "alltime":
      return findTrack(store.tracksDetails_all) || null
    case "1year":
      return findTrack(store.tracksDetails_year) || null
    case "6months":
      return findTrack(store.tracksDetails_6months) || null
    default:
      return null
  }
}
