import { createPackageAction } from "@/actions/package/create-package-action";
import { getAllTracksAction } from "@/actions/package/get-all-tracks-action";
import { saveNewDataAction } from "@/actions/package/save-new-data-action";
import { savePlaybacksAction } from "@/actions/package/save-playbacks-action";
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

    console.time("Processing time");
    console.log("Processing files...");
    const files = await extractZipAndGetFiles(buffer, filesRegexPattern);
    const data = parseZipFiles<DataType>(files);

    await saveData(data);

    console.timeEnd("Processing time");

    return { message: "ok" };
  } catch (error) {
    console.error("Error processing files:", error as Error);
    return { message: "error", error: (error as Error).toString() };
  }
}

const saveData = async (data: DataType[][]) => {
  const tracks = await getAllTracksAction();
  const newTracks = new Set<string>();

  if (!tracks) {
    console.error("Failed to fetch tracks");
    return;
  }

  for (const track of data.flat()) {
    const trackUri = track.spotify_track_uri?.split(":")[2];

    if (!tracks.has(trackUri) && !newTracks.has(trackUri) && trackUri) {
      newTracks.add(trackUri);
    }
  }

  await saveNewDataAction(newTracks);
  const packageId = await createPackageAction(data[0][0]);

  if (packageId instanceof Error) {
    console.error("Failed to create package:", packageId);
    return;
  }

  const dataFlat = data.flat();
  const chunkSize = 100;
  const chunkTracks = [];
  for (let i = 0; i < dataFlat.length; i += chunkSize) {
    chunkTracks.push(dataFlat.slice(i, i + chunkSize));
  }

  for (const chunk of chunkTracks) {
    await savePlaybacksAction(chunk, packageId);
  }
};
