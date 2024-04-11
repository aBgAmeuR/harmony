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
