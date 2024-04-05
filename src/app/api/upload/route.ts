import { getTopTracks, getTracksInfo, getUserData } from "./extractor"
import { storeTracks } from "./store"
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

  const topTracksAllTime = getTopTracks(allTimeData)
  const topTracksLastYear = getTopTracks(lastYearData)
  const topTracksLast6Months = getTopTracks(last6MonthsData)

  const [allTimeTracks, lastYearTracks, last6MonthsTracks] = await Promise.all([
    getTracksInfo(topTracksAllTime),
    getTracksInfo(topTracksLastYear),
    getTracksInfo(topTracksLast6Months),
  ])

  await storeTracks(
    {
      allTimeTracks,
      lastYearTracks,
      last6MonthsTracks,
    },
    user
  )


  return new Response("ok")
}
