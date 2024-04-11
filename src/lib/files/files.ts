import { storeData } from "../store"
import {
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  getUserData,
} from "./extractor"
import {
  extractZipAndVerifyFiles,
  mergeStreamingDataAndSort,
} from "./validation"

export async function filesProcessing(file: File) {
  try {
    const buffer = await file.arrayBuffer()
    const arrayBuffer = Buffer.from(buffer)

    const files = await extractZipAndVerifyFiles(arrayBuffer)

    const { allTimeData, lastYearData, last6MonthsData, lastTrack } =
      await mergeStreamingDataAndSort(files)

    const user = getUserData(lastTrack)

    const [
      allTimeTracks,
      lastYearTracks,
      last6MonthsTracks,
      allTimeArtists,
      lastYearArtists,
      last6MonthsArtists,
      allTimeAlbums,
      lastYearAlbums,
      last6MonthsAlbums,
    ] = await Promise.all([
      getTopTracks(allTimeData),
      getTopTracks(lastYearData),
      getTopTracks(last6MonthsData),
      getTopArtists(allTimeData),
      getTopArtists(lastYearData),
      getTopArtists(last6MonthsData),
      getTopAlbums(allTimeData),
      getTopAlbums(lastYearData),
      getTopAlbums(last6MonthsData),
    ])

    storeData({
      user,
      allTimeTracks,
      lastYearTracks,
      last6MonthsTracks,
      allTimeArtists,
      lastYearArtists,
      last6MonthsArtists,
      allTimeAlbums,
      lastYearAlbums,
      last6MonthsAlbums,
    })

    return { message: "ok" }
  } catch (error) {
    console.error(error)
    return { message: "error", error: error }
  }
}
