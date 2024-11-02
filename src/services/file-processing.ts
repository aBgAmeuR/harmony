import { extractZipAndGetFiles, parseZipFiles } from "@/lib/zip";
import { DataType } from "@/types/data";

/**
 * Processes files and organizes data fetching and storage.
 * @param file The file to be processed.
 * @returns A status message object indicating the result of the operation.
 */
export async function filesProcessing(file: File) {
  try {
    const buffer = await file.arrayBuffer();
    const filesRegexPattern =
      /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json/;

    const files = await extractZipAndGetFiles(buffer, filesRegexPattern);
    const data = parseZipFiles<DataType>(files);

    console.log("Files extracted:", data);

    return { message: "ok" };
  } catch (error) {
    console.error("Error processing files:", error as Error);
    return { message: "error", error: (error as Error).toString() };
  }
}
