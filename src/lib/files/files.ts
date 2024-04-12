import { storeData } from "../store"
import {
  getAlbumsDetails,
  getArtistsDetails,
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  getTracksDetails,
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

    const user = await getUserData(lastTrack)

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

    const [
      artistsDetails_6months,
      artistsDetails_year,
      artistsDetails_all,
      albumsDetails_6months,
      albumsDetails_year,
      albumsDetails_all,
      tracksDetails_6months,
      tracksDetails_year,
      tracksDetails_all,
    ] = await Promise.all([
      getArtistsDetails(last6MonthsArtists, last6MonthsData),
      getArtistsDetails(lastYearArtists, lastYearData),
      getArtistsDetails(allTimeArtists, allTimeData),
      getAlbumsDetails(last6MonthsAlbums, last6MonthsData),
      getAlbumsDetails(lastYearAlbums, lastYearData),
      getAlbumsDetails(allTimeAlbums, allTimeData),
      getTracksDetails(last6MonthsTracks, last6MonthsData),
      getTracksDetails(lastYearTracks, lastYearData),
      getTracksDetails(allTimeTracks, allTimeData),
    ])

    storeData({
      user,
      ranking: {
        allTimeTracks,
        lastYearTracks,
        last6MonthsTracks,
        allTimeArtists,
        lastYearArtists,
        last6MonthsArtists,
        allTimeAlbums,
        lastYearAlbums,
        last6MonthsAlbums,
      },
      details: {
        artistsDetails_6months,
        artistsDetails_year,
        artistsDetails_all,
        albumsDetails_6months,
        albumsDetails_year,
        albumsDetails_all,
        tracksDetails_6months,
        tracksDetails_year,
        tracksDetails_all,
      },
    })

    return { message: "ok" }
  } catch (error) {
    console.error(error)
    return { message: "error", error: error }
  }
}
