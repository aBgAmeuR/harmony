"use client"

import {
  AlbumDetailsType,
  AlbumType,
  ArtistDetailsType,
  ArtistType,
  BasicUser,
  DataResults,
  DetailedData,
  EntityType,
  RankingData,
  TablesType,
  TimeRange,
  TrackDetailsType,
  TrackType,
} from "@/types/data-type"

/**
 * Clears and stores new data into localStorage.
 * @param data DataResults to store.
 */
export const storeData = (data: DataResults): void => {
  localStorage.clear()
  localStorage.setItem("user", JSON.stringify(data.user))
  localStorage.setItem("ranking", JSON.stringify(data.ranking))
  localStorage.setItem("details", JSON.stringify(data.details))
}

/**
 * Retrieves user data from localStorage.
 * @returns BasicUser or null if not found.
 */
export const getUserInfo = (): BasicUser | null => {
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
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
 * Retrieves tracks based on timeframe.
 * @param timeframe Timeframe of the data to retrieve.
 * @returns Array of TrackType.
 */
export const getTracks = (timeframe: TimeRange): TrackType[] => {
  const ranking = safelyParseJson<RankingData>("ranking")
  return ranking
    ? timeframeMapping<TrackType>(ranking, "tracks", "Ranking", timeframe)
    : []
}

/**
 * Retrieves artists based on timeframe.
 * @param timeframe Timeframe of the data to retrieve.
 * @returns Array of ArtistType.
 */
export const getArtists = (timeframe: TimeRange): ArtistType[] => {
  const ranking = safelyParseJson<RankingData>("ranking")
  return ranking
    ? timeframeMapping<ArtistType>(ranking, "artists", "Ranking", timeframe)
    : []
}

/**
 * Retrieves albums based on timeframe.
 * @param timeframe Timeframe of the data to retrieve.
 * @returns Array of AlbumType.
 */
export const getAlbums = (timeframe: TimeRange): AlbumType[] => {
  const ranking = safelyParseJson<RankingData>("ranking")
  return ranking
    ? timeframeMapping<AlbumType>(ranking, "albums", "Ranking", timeframe)
    : []
}

/**
 * Retrieves artist details based on timeframe and artist ID.
 * @param timeframe Timeframe of the data to retrieve.
 * @param artistId Spotify URI of the artist.
 * @returns ArtistDetailsType or null if not found.
 */
export const getArtistDetails = (
  timeframe: TimeRange,
  artistId: string
): ArtistDetailsType | null => {
  const details = safelyParseJson<DetailedData>("details")
  return details
    ? findDetail<ArtistDetailsType>(details, "artists", artistId, timeframe)
    : null
}

/**
 * Retrieves album details based on timeframe and album ID.
 * @param timeframe Timeframe of the data to retrieve.
 * @param albumId Spotify URI of the album.
 * @returns AlbumDetailsType or null if not found.
 */
export const getAlbumDetails = (
  timeframe: TimeRange,
  albumId: string
): AlbumDetailsType | null => {
  const details = safelyParseJson<DetailedData>("details")
  return details
    ? findDetail<AlbumDetailsType>(details, "albums", albumId, timeframe)
    : null
}

/**
 * Retrieves track details based on timeframe and track ID.
 * @param timeframe Timeframe of the data to retrieve.
 * @param trackId Spotify URI of the track.
 * @returns TrackDetailsType or null if not found.
 */
export const getTrackDetails = (
  timeframe: TimeRange,
  trackId: string
): TrackDetailsType | null => {
  const details = safelyParseJson<DetailedData>("details")
  return details
    ? findDetail<TrackDetailsType>(details, "tracks", trackId, timeframe)
    : null
}

/**
 * Retrieves data based on entity type, table name, and timeframe.
 * @param data Data to retrieve from.
 * @param entity Entity type to retrieve.
 * @param tableName Table name to retrieve.
 * @param timeframe Timeframe of the data to retrieve.
 * @returns Array of T.
 */
function timeframeMapping<T>(
  data: RankingData | DetailedData,
  entity: EntityType,
  tableName: TablesType,
  timeframe: TimeRange
): T[] {
  const key = `${entity}_${tableName}_${timeframe}`
  return ((data as any)[key] as T[]) || []
}

/**
 * Finds detail based on entity type, ID, and timeframe.
 * @param details DetailedData to search.
 * @param entityType Entity type to search.
 * @param id ID of the entity to search.
 * @param timeframe Timeframe of the data to search.
 * @returns T or null if not found.
 */
function findDetail<T>(
  details: DetailedData,
  entityType: EntityType,
  id: string,
  timeframe: TimeRange
): T | null {
  const detailList = timeframeMapping<T>(
    details,
    entityType,
    "Details",
    timeframe
  )
  return (
    detailList.find(
      (item: any) =>
        item.spotify_uri ===
        `spotify:${entityType.substring(0, entityType.length - 1)}:${id}`
    ) || null
  )
}
