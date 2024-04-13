import { DataType } from "@/types"
import JSZip from "jszip"

/**
 * Extracts relevant JSON files from a provided ZIP buffer.
 * @param arrayBuffer The ArrayBuffer of the ZIP file.
 * @returns An array of JSZipObject representing JSON files.
 */
export async function extractZipAndVerifyFiles(
  arrayBuffer: ArrayBuffer
): Promise<JSZip.JSZipObject[]> {
  const zip = new JSZip()
  await zip.loadAsync(arrayBuffer)
  const regexPattern =
    /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json/
  const files = zip.file(regexPattern)

  if (files.length === 0) {
    throw new Error("No valid files found in the zip")
  }
  return files
}

/**
 * Converts JSZipObject files to an array of DataType.
 * @param files Array of JSZip.JSZipObject to be processed.
 * @returns An array of DataType.
 */
export async function parseZipFiles(
  files: JSZip.JSZipObject[]
): Promise<DataType[]> {
  return (
    await Promise.all(
      files.map((file) =>
        file.async("text").then((json) => JSON.parse(json) as DataType[])
      )
    )
  ).flat()
}

export type JSZipObject = JSZip.JSZipObject
