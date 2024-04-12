import JSZip from "jszip"

import { CleanDataType, DataType } from "./data"


export async function extractZipAndVerifyFiles(
  arrayBuffer: ArrayBuffer
): Promise<JSZip.JSZipObject[]> {
  const zip = new JSZip()
  await zip.loadAsync(arrayBuffer)
  const files = zip.file(
    /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json/
  )
  const fileNames = files.map((file) => file.name)

  if (fileNames.length === 0) {
    throw new Error("No valid files found in the zip")
  }
  return files
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
      entry.ms_played < 3000 ||
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

export async function mergeStreamingDataAndSort(
  files: JSZip.JSZipObject[]
): Promise<{
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
