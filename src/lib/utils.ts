import { CleanDataType } from "@/types"
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
    const keyValue = item[key] as string // Assuming the key value is a string
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
