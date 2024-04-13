import { ChartData, CleanDataType, DataType } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges classnames with Tailwind CSS.
 * @param inputs Classnames to merge.
 * @returns Merged classnames.
 * @example
 * ```tsx
 * import { cn } from "lib/utils"
 *
 * const className = cn("text-black", "bg-white")
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the href for a given uri.
 * @param uri Spotify URI.
 * @param type Type of the URI.
 * @returns Href for the URI.
 */
export function getHref(uri: string, type: "artists" | "albums" | "tracks") {
  const id = uri.split(":")[2]
  return `/ranking/${type}/${id}`
}

/**
 * Calculates score based on total plays and milliseconds played.
 * @param totalPlayed Number of times played.
 * @param msPlayed Milliseconds played.
 * @returns Calculated score.
 */
export const calculateScore = (totalPlayed: number, msPlayed: number) =>
  (totalPlayed + msPlayed / 1e6) / 2

/**
 * Filters data based on a key.
 * @param data Data to filter.
 * @param key Key to filter by.
 * @returns Filtered data.
 */
export function sortDataDescending<T>(data: T[], key: keyof T) {
  return data.sort((a, b) => (b[key] as number) - (a[key] as number))
}

/**
 * Filters data based on a key.
 * @param data Data to filter.
 * @param key Key to filter by.
 * @returns Filtered data.
 */
export async function fetchData<T>(url: string, payload: any): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching data from ${url}: ${error}`)
    throw error
  }
}

/**
 * Filters data based on a key.
 * @param data Data to filter.
 * @param key Key to filter by.
 * @returns Filtered data.
 */
export function filterDataByKey(
  data: CleanDataType[],
  key: keyof CleanDataType
): Record<string, CleanDataType> {
  const groupedData: Record<string, CleanDataType> = {}

  data.forEach((item) => {
    const keyValue = item[key] as string
    if (groupedData[keyValue]) {
      groupedData[keyValue].total_played += item.total_played
      groupedData[keyValue].ms_played += item.ms_played
    } else {
      groupedData[keyValue] = {
        ...item,
        total_played: item.total_played,
        ms_played: item.ms_played,
      }
    }
  })

  return groupedData
}

/**
 * Counts unique values for a given key in the data array.
 * @param data Data to count unique values from.
 * @param key Key to count unique values for.
 * @returns Number of unique values.
 */
export function countUniqueValuesForKey(
  data: CleanDataType[],
  key: keyof CleanDataType
): number {
  const values = new Set<string>()
  data.forEach((item) => {
    const keyValue = item[key] as string
    values.add(keyValue)
  })
  return values.size
}

/**
 * Filters data based on multiple keys.
 * @param data Data to filter.
 * @param keys Keys to filter by.
 * @param name Name of the key.
 * @returns Filtered data.
 */
export function getChartData(data: DataType[]): {
  hourly_distribution: ChartData
  daily_distribution: ChartData
} {
  const hourlyData: ChartData = {}
  const dailyData: ChartData = {}

  data.forEach((item) => {
    const ts = new Date(item.ts)
    const hour = ts.getHours()
    const day = ts.getDay()

    if (hourlyData[hour]) {
      hourlyData[hour].total_streams += 1
      hourlyData[hour].total_ms_played += item.ms_played
    } else {
      hourlyData[hour] = {
        total_streams: 1,
        total_ms_played: item.ms_played,
      }
    }

    if (dailyData[day]) {
      dailyData[day].total_streams += 1
      dailyData[day].total_ms_played += item.ms_played
    } else {
      dailyData[day] = {
        total_streams: 1,
        total_ms_played: item.ms_played,
      }
    }
  })

  return { hourly_distribution: hourlyData, daily_distribution: dailyData }
}

/**
 * Calculates the average daily streams and milliseconds played.
 * @param data Data to calculate the average from.
 * @returns Average daily streams and milliseconds played.
 */
export function getAverageDailyData(data: DataType[]): {
  averageDailyStreams: number
  averageDailyMsPlayed: number
} {
  const dailyData: ChartData = {}
  const totalStreams = data.length
  const totalMsPlayed = data.reduce((acc, curr) => acc + curr.ms_played, 0)

  data.forEach((item) => {
    const ts = new Date(item.ts)
    const day = `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}`

    if (dailyData[day]) {
      dailyData[day].total_streams += 1
      dailyData[day].total_ms_played += item.ms_played
    } else {
      dailyData[day] = {
        total_streams: 1,
        total_ms_played: item.ms_played,
      }
    }
  })

  const averageDailyStreams = Math.round(
    totalStreams / Object.keys(dailyData).length
  )
  const averageDailyMsPlayed = Math.round(
    totalMsPlayed / Object.keys(dailyData).length
  )

  return { averageDailyStreams, averageDailyMsPlayed }
}
