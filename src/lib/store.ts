"use client"

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

export const storeData = (data: StoreData) => {
  localStorage.clear()
  localStorage.setItem("ranking", JSON.stringify(data))
}

export const getTracks = (timeframe: "alltime" | "1year" | "6months") => {
  if (typeof window === "undefined") return []
  const store = JSON.parse(localStorage.getItem("ranking") || "[]") as StoreData
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
  const store = JSON.parse(localStorage.getItem("ranking") || "[]") as StoreData
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
  const store = JSON.parse(localStorage.getItem("ranking") || "[]") as StoreData
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
