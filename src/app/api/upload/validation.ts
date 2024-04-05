import JSZip from "jszip"

import { CleanDataType, DataType } from "./data"

export function validateFile(file: unknown): {
  response: Response | null
  file: File
} {
  let response: Response | null = null

  if (!(file instanceof File))
    response = new Response("invalid file", { status: 400 })
  else if (file.size > 10 * 1024 ** 2)
    response = new Response("file too large", { status: 400 })
  else if (!file.type.match("application/zip"))
    response = new Response("invalid file type", { status: 400 })
  else if (!file.name.match("my_spotify_data.zip"))
    response = new Response("invalid file name", { status: 400 })
  return { response, file: file as File }
}

export async function extractAndVerifyZip(
  file: File
): Promise<{ response: Response | null; files: JSZip.JSZipObject[] }> {
  let response: Response | null = null
  const arrayBuffer = await file.arrayBuffer()
  const zip = new JSZip()
  await zip.loadAsync(arrayBuffer)
  const files = zip.file(
    /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json/
  )
  const fileNames = files.map((file) => file.name)

  if (fileNames.length === 0) {
    response = new Response("no files found", { status: 400 })
  }
  return { response, files }
}

function filterDataByPeriod(data: DataType[], months: number): DataType[] {
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - months)
  return data.filter((entry) => new Date(entry.ts) >= cutoffDate)
}

function cleanData(data: DataType[]): CleanDataType[] {
  const cleanedData: Record<string, CleanDataType> = {}

  data.forEach((entry) => {
    const isInvalidEntry = [
      entry.ms_played < 1000 ||
        entry.spotify_track_uri === "null" ||
        entry.spotify_track_uri === null,
    ].some(Boolean)

    if (isInvalidEntry) return

    const uri = entry.spotify_track_uri
    if (cleanedData[uri]) {
      cleanedData[uri].total_played += 1
      cleanedData[uri].ms_played += entry.ms_played
    } else {
      cleanedData[uri] = {
        total_played: 1,
        ms_played: entry.ms_played,
        track_name: entry.master_metadata_track_name,
        artist_name: entry.master_metadata_album_artist_name,
        album_name: entry.master_metadata_album_album_name,
        spotify_track_uri: uri,
      }
    }
  })

  return Object.values(cleanedData)
}

export async function mergeStreamingDataAndSort(files: JSZip.JSZipObject[]): Promise<{
  last6MonthsData: CleanDataType[]
  lastYearData: CleanDataType[]
  allTimeData: CleanDataType[]
  lastTrack: DataType
}> {
  const mergedData = (
    await Promise.all(
      files.map((file) =>
        file.async("text").then((json) => JSON.parse(json) as DataType[])
      )
    )
  ).flat()

  const lastYearData = filterDataByPeriod(mergedData, 12)
  const last6MonthsData = filterDataByPeriod(lastYearData, 6)

  return {
    last6MonthsData: cleanData(last6MonthsData),
    lastYearData: cleanData(lastYearData),
    allTimeData: cleanData(mergedData),
    lastTrack: last6MonthsData[0],
  }
}
