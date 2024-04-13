import { JSZipObject, parseZipFiles } from "@/services/zip"
import { CleanDataType, DataType } from "@/types"

/**
 * Filters data entries based on a specific period.
 * @param data Array of DataType.
 * @param months Number of months to filter by.
 * @returns Filtered array of DataType.
 */
function filterDataByPeriod(data: DataType[], months: number): DataType[] {
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - months)
  return data.filter((entry) => new Date(entry.ts) >= cutoffDate)
}

/**
 * Cleans data by aggregating it based on Spotify track URI.
 * @param data Array of DataType.
 * @returns Array of CleanDataType.
 */
function cleanData(data: DataType[]): CleanDataType[] {
  const cleanedData: Record<string, CleanDataType> = {}

  data.forEach((entry) => {
    const uri = entry.spotify_track_uri
    const current = cleanedData[uri]
    if (current) {
      current.total_played++
      current.ms_played += entry.ms_played
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

/**
 * Removes invalid data entries.
 * @param data Array of DataType.
 * @returns Array of DataType.
 */
function removeInvalidData(data: DataType[]): DataType[] {
  return data.filter(
    (entry) => entry.ms_played >= 3000 && entry.spotify_track_uri
  )
}

/**
 * Merges and sorts streaming data from an array of DataType.
 * @param files Array of JSZip.JSZipObject from ZIP extraction.
 * @returns Object with filtered and cleaned data.
 */
export async function mergeStreamingDataAndSort(files: JSZipObject[]): Promise<{
  long_term_data: CleanDataType[]
  medium_term_data: CleanDataType[]
  short_term_data: CleanDataType[]
  lastTrack: DataType
  long_term_raw_data: DataType[]
  medium_term_raw_data: DataType[]
  short_term_raw_data: DataType[]
}> {
  let allData = await parseZipFiles(files)
  let lastYearData = filterDataByPeriod(allData, 12)
  let last6MonthsData = filterDataByPeriod(lastYearData, 6)

  allData = removeInvalidData(allData)
  lastYearData = removeInvalidData(lastYearData)
  last6MonthsData = removeInvalidData(last6MonthsData)

  return {
    long_term_data: cleanData(allData),
    medium_term_data: cleanData(lastYearData),
    short_term_data: cleanData(last6MonthsData),
    lastTrack: last6MonthsData[0],
    long_term_raw_data: allData,
    medium_term_raw_data: lastYearData,
    short_term_raw_data: last6MonthsData,
  }
}
