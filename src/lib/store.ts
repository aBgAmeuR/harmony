"use client"

import {
  Album,
  Artist,
  BasicUser,
  DataResults,
  SongsData,
  StatsData,
  TimeRange,
  Track,
} from "@/types"

/**
 * Clears and stores new data into localStorage.
 * @param data DataResults to store.
 */
export const storeData = (data: DataResults): void => {
  localStorage.clear()
  localStorage.setItem("user", JSON.stringify(data.user))
  localStorage.setItem("songs", JSON.stringify(data.songs))
  localStorage.setItem("stats", JSON.stringify(data.stats))
}

/**
 * Retrieves data from localStorage.
 * @param key Key of the data to retrieve.
 * @returns DataResults or null if not found.
 */
function safelyParseJson<T>(key: string): T | null {
  const item = localStorage.getItem(key)
  try {
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("Failed to parse JSON from local storage:", error)
    return null
  }
}

/**
 * Retrieves user data from localStorage.
 * @returns BasicUser or null if not found.
 */
export const getUserInfo = (): BasicUser | null => {
  return safelyParseJson<BasicUser>("user")
}

/**
 * Retrieves tracks based on timeframe.
 * @param timeframe Timeframe of the data to retrieve.
 * @returns Array of Track.
 */
export const getTracks = (
  timeframe: TimeRange,
  id: string | null = null
): Track[] => {
  const songs = safelyParseJson<SongsData>("songs")
  if (!songs) return []
  const tracks = timeframeMapping<Track>(songs, "tracks", timeframe)
  return id ? tracks.filter((track) => track.spotify_uri.includes(id)) : tracks
}

/**
 * Retrieves artists based on timeframe.
 * @param timeframe Timeframe of the data to retrieve.
 * @returns Array of Artist.
 */
export const getArtists = (
  timeframe: TimeRange,
  id: string | null = null
): Artist[] => {
  const songs = safelyParseJson<SongsData>("songs")
  if (!songs) return []
  const artists = timeframeMapping<Artist>(songs, "artists", timeframe)
  return id
    ? artists.filter((artist) => artist.spotify_uri.includes(id))
    : artists
}

/**
 * Retrieves albums based on timeframe.
 * @param timeframe Timeframe of the data to retrieve.
 * @returns Array of Album.
 */
export const getAlbums = (
  timeframe: TimeRange,
  id: string | null = null
): Album[] => {
  const songs = safelyParseJson<SongsData>("songs")
  if (!songs) return []
  const albums = timeframeMapping<Album>(songs, "albums", timeframe)
  return id ? albums.filter((album) => album.spotify_uri.includes(id)) : albums
}

export const getStats = (
  timeframe: TimeRange
): StatsData[TimeRange] | null => {
  const stats = safelyParseJson<StatsData>("stats")
  return stats ? stats[timeframe] : null
}

/**
 * Maps data based on timeframe.
 * @param data SongsData to map.
 * @param type Type of data to map.
 * @param timeframe Timeframe of the data to map.
 * @returns Array of T.
 */
function timeframeMapping<T>(
  data: SongsData,
  type: "tracks" | "artists" | "albums",
  timeframe: TimeRange
): T[] {
  return data[timeframe][type]
}
