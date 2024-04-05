import { getTopArtists, getTopTracks, getUserData } from "./extractor"
import { storeArtists, storeTracks } from "./store"
import {
  extractAndVerifyZip,
  mergeStreamingDataAndSort,
  validateFile,
} from "./validation"

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as unknown

  const { file: validatedFile, response: validateResponse } = validateFile(file)
  if (validateResponse) return validateResponse

  const { files, response: extractZipResponse } =
    await extractAndVerifyZip(validatedFile)
  if (extractZipResponse) return extractZipResponse

  const { allTimeData, lastYearData, last6MonthsData, lastTrack } =
    await mergeStreamingDataAndSort(files)

  const user = getUserData(lastTrack)

  // Tracks
  const [allTimeTracks, lastYearTracks, last6MonthsTracks] = await Promise.all([
    getTopTracks(allTimeData),
    getTopTracks(lastYearData),
    getTopTracks(last6MonthsData),
  ])

  await storeTracks(allTimeTracks, lastYearTracks, last6MonthsTracks, user)

  // Artists
  const [allTimeArtists, lastYearArtists, last6MonthsArtists] =
    await Promise.all([
      getTopArtists(allTimeData),
      getTopArtists(lastYearData),
      getTopArtists(last6MonthsData),
    ])

  await storeArtists(allTimeArtists, lastYearArtists, last6MonthsArtists, user)

  return new Response("ok")
}
