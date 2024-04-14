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

type DataMap = {
  [key: string]: {
    total_streams: number
    total_ms_played: number
    time: string
  }
}

/**
 * Formats month to MM/YY.
 * @param month Month to format.
 * @returns Formatted month.
 * @example
 * ```ts
 * formatMonth("1/2021") // "01/21"
 * ```
 */
function formatMonth(month: string): string {
  const [m, y] = month.split("/")
  return `${m.padStart(2, "0")}/${y.slice(-2)}`
}

/**
 * Converts time to a number.
 * @param time Time to convert.
 * @returns Converted time.
 * @example
 * ```ts
 * convertTimeToNumber("01/21") // 2101
 * ```
 */
function convertTimeToNumber(time: string): number {
  const [day, year] = time.split("/")
  return parseInt(year + day)
}

/**
 * Filters data based on multiple keys.
 * @param data Data to filter.
 * @param keys Keys to filter by.
 * @param name Name of the key.
 * @returns Filtered data.
 * 
export type ChartData = Array<{
  total_streams: number
  total_ms_played: number
  time: string
}>
 */
export function getChartData(data: DataType[]): {
  hourly_distribution: ChartData
  monthly_distribution: ChartData
} {
  const hourlyData: DataMap = {}
  const monthlyData: DataMap = {}

  for (let i = 0; i < 24; i++) {
    if (!hourlyData[i]) {
      hourlyData[i] = {
        total_streams: 0,
        total_ms_played: 0,
        time: `${i}h`,
      }
    }
  }

  const lastSongs = data.sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
  )[0]
  const lastSongDate = new Date(lastSongs.ts)
  const currentMonth = lastSongDate.getMonth()
  const currentYear = lastSongDate.getFullYear()
  for (let i = 0; i <= currentMonth; i++) {
    const month = formatMonth(`${i + 1}/${currentYear}`)
    if (!monthlyData[month]) {
      monthlyData[month] = {
        total_streams: 0,
        total_ms_played: 0,
        time: month,
      }
    }
  }

  data.forEach((item) => {
    const ts = new Date(item.ts)
    const hour = ts.getHours()
    const month = formatMonth(`${ts.getMonth() + 1}/${ts.getFullYear()}`)

    if (!hourlyData[hour]) {
      hourlyData[hour] = {
        total_streams: 0,
        total_ms_played: 0,
        time: `${hour}h`,
      }
    }

    if (!monthlyData[month]) {
      monthlyData[month] = {
        total_streams: 0,
        total_ms_played: 0,
        time: month,
      }
    }

    hourlyData[hour].total_streams += 1
    hourlyData[hour].total_ms_played += item.ms_played

    monthlyData[month].total_streams += 1
    monthlyData[month].total_ms_played += item.ms_played
  })

  const hourly_distribution = Object.values(hourlyData)
  hourly_distribution.sort(
    (a, b) => convertTimeToNumber(a.time) - convertTimeToNumber(b.time)
  )
  const monthly_distribution = Object.values(monthlyData)
  monthly_distribution.sort(
    (a, b) => convertTimeToNumber(a.time) - convertTimeToNumber(b.time)
  )

  return { hourly_distribution, monthly_distribution }
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
  const dailyData: {
    [key: string]: { total_streams: number; total_ms_played: number }
  } = {}
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

/**
 * Gets the day with the most streams.
 * @param data Data to calculate the day with most streams from.
 * @returns Day with the most streams.
 */
export function getDayWithMostStreams(data: DataType[]): {
  date: string
  streams: number
  ms_played: number
} {
  const dailyData: {
    [key: string]: {
      streams: number
      ms_played: number
    }
  } = {}

  data.forEach((item) => {
    const ts = new Date(item.ts)
    const day = `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}`

    if (dailyData[day]) {
      dailyData[day].streams += 1
      dailyData[day].ms_played += item.ms_played
    } else {
      dailyData[day] = {
        streams: 1,
        ms_played: item.ms_played,
      }
    }
  })

  const dailyDataArray: { date: string; streams: number; ms_played: number }[] =
    []
  for (const [date, { streams, ms_played }] of Object.entries(dailyData)) {
    dailyDataArray.push({ date, streams, ms_played })
  }
  const sortedData = sortDataDescending(dailyDataArray, "ms_played")

  return sortedData[0]
}
