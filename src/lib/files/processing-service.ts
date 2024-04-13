import { CleanDataType, DataType, DetailedData, RankingData } from "@/types"

import { storeData } from "@/lib/store"
import { extractZipAndVerifyFiles } from "@/lib/zipService"

import {
  getAlbumsDetails,
  getArtistsDetails,
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  getTracksDetails,
  getUserData,
} from "./extractor"
import { mergeStreamingDataAndSort } from "./validation"

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
    const results = await fetchDataAndDetails(data)

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
async function fetchDataAndDetails(data: {
  allTimeData: CleanDataType[]
  lastYearData: CleanDataType[]
  last6MonthsData: CleanDataType[]
  lastTrack: DataType
}) {
  const { allTimeData, lastYearData, last6MonthsData, lastTrack } = data

  const user = await getUserData(lastTrack)
  const basicData = await fetchBasicData({
    allTimeData,
    lastYearData,
    last6MonthsData,
  })
  const detailedData = await fetchDetailedData({
    basicData,
    allTimeData,
    lastYearData,
    last6MonthsData,
  })

  return {
    user,
    ranking: basicData,
    details: detailedData,
  }
}

/**
 * Fetches basic data for tracks, artists, and albums.
 */
async function fetchBasicData(props: {
  allTimeData: CleanDataType[]
  lastYearData: CleanDataType[]
  last6MonthsData: CleanDataType[]
}): Promise<RankingData> {
  const [
    tracks_Ranking_alltime,
    tracks_Ranking_1year,
    tracks_Ranking_6months,
    artists_Ranking_alltime,
    artists_Ranking_1year,
    artists_Ranking_6months,
    albums_Ranking_alltime,
    albums_Ranking_1year,
    albums_Ranking_6months,
  ] = await Promise.all([
    getTopTracks(props.allTimeData),
    getTopTracks(props.lastYearData),
    getTopTracks(props.last6MonthsData),
    getTopArtists(props.allTimeData),
    getTopArtists(props.lastYearData),
    getTopArtists(props.last6MonthsData),
    getTopAlbums(props.allTimeData),
    getTopAlbums(props.lastYearData),
    getTopAlbums(props.last6MonthsData),
  ])

  return {
    tracks_Ranking_alltime,
    tracks_Ranking_1year,
    tracks_Ranking_6months,
    artists_Ranking_alltime,
    artists_Ranking_1year,
    artists_Ranking_6months,
    albums_Ranking_alltime,
    albums_Ranking_1year,
    albums_Ranking_6months,
  }
}

/**
 * Fetches detailed data for artists, albums, and tracks.
 */
async function fetchDetailedData(props: {
  basicData: RankingData
  last6MonthsData: CleanDataType[]
  lastYearData: CleanDataType[]
  allTimeData: CleanDataType[]
}): Promise<DetailedData> {
  const {
    tracks_Ranking_alltime,
    tracks_Ranking_1year,
    tracks_Ranking_6months,
    artists_Ranking_alltime,
    artists_Ranking_1year,
    artists_Ranking_6months,
    albums_Ranking_alltime,
    albums_Ranking_1year,
    albums_Ranking_6months,
  } = props.basicData

  const [
    artists_Details_6months,
    artists_Details_1year,
    artists_Details_alltime,
    albums_Details_6months,
    albums_Details_1year,
    albums_Details_alltime,
    tracks_Details_6months,
    tracks_Details_1year,
    tracks_Details_alltime,
  ] = await Promise.all([
    getArtistsDetails(artists_Ranking_6months, props.last6MonthsData),
    getArtistsDetails(artists_Ranking_1year, props.lastYearData),
    getArtistsDetails(artists_Ranking_alltime, props.allTimeData),
    getAlbumsDetails(albums_Ranking_6months, props.last6MonthsData),
    getAlbumsDetails(albums_Ranking_1year, props.lastYearData),
    getAlbumsDetails(albums_Ranking_alltime, props.allTimeData),
    getTracksDetails(tracks_Ranking_6months, props.last6MonthsData),
    getTracksDetails(tracks_Ranking_1year, props.lastYearData),
    getTracksDetails(tracks_Ranking_alltime, props.allTimeData),
  ])

  return {
    artists_Details_6months,
    artists_Details_1year,
    artists_Details_alltime,
    albums_Details_6months,
    albums_Details_1year,
    albums_Details_alltime,
    tracks_Details_6months,
    tracks_Details_1year,
    tracks_Details_alltime,
  }
}
