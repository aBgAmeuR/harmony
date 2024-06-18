import { extractZipAndVerifyFiles } from "@/services/zip"
import {
  CleanDataType,
  DataResults,
  DataType,
  SongsData,
  StatsData,
} from "@/types"

import { storeData } from "@/lib/store"

import {
  getStatsData,
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  getUserData,
} from "./data-extractor"
import { mergeStreamingDataAndSort } from "./file-validation"

/**
 * Processes files and organizes data fetching and storage.
 * @param file The file to be processed.
 * @returns A status message object indicating the result of the operation.
 */
export async function filesProcessing(file: File) {
  try {
    const buffer = await file.arrayBuffer()
    const arrayBuffer = Buffer.from(buffer)

    const files = await extractZipAndVerifyFiles(arrayBuffer)
    const data = await mergeStreamingDataAndSort(files)
    const results = await fetchData(data)

    storeData(results)

    return { message: "ok" }
  } catch (error) {
    console.error("Error processing files:", error as Error)
    return { message: "error", error: (error as Error).toString() }
  }
}

/**
 * Fetches data and details based on processed files.
 * @param data Merged and sorted data from files.
 * @returns An object containing all user, ranking, and detailed data.
 */
async function fetchData(data: {
  long_term_data: CleanDataType[]
  medium_term_data: CleanDataType[]
  short_term_data: CleanDataType[]
  lastTrack: DataType
  long_term_raw_data: DataType[]
  medium_term_raw_data: DataType[]
  short_term_raw_data: DataType[]
}): Promise<DataResults> {
  const { long_term_data, medium_term_data, short_term_data, lastTrack } = data

  const user = await getUserData(lastTrack)
  const songsData = await fetchSongsData({
    long_term_data,
    medium_term_data,
    short_term_data,
  })
  const statsData = await fetchStatsData({
    long_term_data,
    medium_term_data,
    short_term_data,
    long_term_raw_data: data.long_term_raw_data,
    medium_term_raw_data: data.medium_term_raw_data,
    short_term_raw_data: data.short_term_raw_data,
  })

  return {
    user,
    songs: songsData,
    stats: statsData,
  }
}

/**
 * Fetches basic data for the user.
 * @param data Clean data from files.
 * @returns Basic data for the user.
 */
async function fetchSongsData(data: {
  long_term_data: CleanDataType[]
  medium_term_data: CleanDataType[]
  short_term_data: CleanDataType[]
}): Promise<SongsData> {
  const [long_term_tracks, long_term_artists, long_term_albums] =
    await Promise.all([
      getTopTracks(data.long_term_data),
      getTopArtists(data.long_term_data),
      getTopAlbums(data.long_term_data),
    ])

  const [medium_term_tracks, medium_term_artists, medium_term_albums] =
    await Promise.all([
      getTopTracks(data.medium_term_data),
      getTopArtists(data.medium_term_data),
      getTopAlbums(data.medium_term_data),
    ])

  const [short_term_tracks, short_term_artists, short_term_albums] =
    await Promise.all([
      getTopTracks(data.short_term_data),
      getTopArtists(data.short_term_data),
      getTopAlbums(data.short_term_data),
    ])

  return {
    long_term: {
      tracks: long_term_tracks,
      artists: long_term_artists,
      albums: long_term_albums,
    },
    medium_term: {
      tracks: medium_term_tracks,
      artists: medium_term_artists,
      albums: medium_term_albums,
    },
    short_term: {
      tracks: short_term_tracks,
      artists: short_term_artists,
      albums: short_term_albums,
    },
  }
}

/**
 * Fetches statistics data based on clean data.
 * @param data Clean data from files.
 * @returns Statistics data based on clean data.
 */
async function fetchStatsData(data: {
  long_term_data: CleanDataType[]
  medium_term_data: CleanDataType[]
  short_term_data: CleanDataType[]
  long_term_raw_data: DataType[]
  medium_term_raw_data: DataType[]
  short_term_raw_data: DataType[]
}): Promise<StatsData> {
  const [long_term_stats, medium_term_stats, short_term_stats] =
    await Promise.all([
      getStatsData(data.long_term_data, data.long_term_raw_data),
      getStatsData(data.medium_term_data, data.medium_term_raw_data),
      getStatsData(data.short_term_data, data.short_term_raw_data),
    ])

  return {
    long_term: long_term_stats,
    medium_term: medium_term_stats,
    short_term: short_term_stats,
  }
}
