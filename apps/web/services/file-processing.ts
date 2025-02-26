import { setDefaulMonthStatsAction } from "~/actions/month-range-actions";
import {
  createPackageAction,
  deleteLastPackageAction,
} from "~/actions/user-package-action";
import { TrackInfo } from "~/app/api/package/tracks/route";
import { extractZipAndGetFiles, parseZipFiles } from "~/lib/zip";
import { DataType } from "~/types/data";

export async function getFiles(file: File) {
  try {
    const buffer = await file.arrayBuffer();
    const filesRegexPattern =
      /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json/;

    console.time("Processing time");
    console.log("Processing files...");
    return await extractZipAndGetFiles(buffer, filesRegexPattern);
  } catch (error) {
    console.error("Error processing files:", error as Error);
    return { message: "error", error: (error as Error).toString() };
  }
}

/**
 * Processes files and organizes data fetching and storage.
 * @param file The file to be processed.
 * @returns A status message object indicating the result of the operation.
 */
export async function filesProcessing(
  file: File,
  files: {
    filename: string;
    content: Uint8Array;
  }[],
  setProgress: (progress: number) => void,
) {
  try {
    const data = parseZipFiles<DataType>(files);

    const res = await saveData(data, file);
    if (res?.message === "error") return res;

    await setDefaulMonthStatsAction();

    console.timeEnd("Processing time");

    return { message: "ok", error: "" };
  } catch (error) {
    console.error("Error processing files:", error as Error);
    return { message: "error", error: (error as Error).toString() };
  }
}

const saveData = async (data: DataType[][], file: File) => {
  const newTracksUri = new Set<string>();

  for (const track of data.flat()) {
    if (filterTrack(track)) continue;

    const trackUri = track.spotify_track_uri.split(":")[2];
    if (!newTracksUri.has(trackUri)) {
      newTracksUri.add(trackUri);
    }
  }
  const tracksIdsResponse = await fetch("/api/package/tracks", {
    method: "POST",
    body: JSON.stringify(Array.from(newTracksUri)),
  });
  const tracksIds = await tracksIdsResponse.json();

  if (tracksIds.message) {
    return { message: "error", error: tracksIds.error };
  }

  const newTracks = data
    .flat()
    .map((track) => {
      if (filterTrack(track)) return null;

      const trackUri = track.spotify_track_uri.split(":")[2];
      const trackInfo = tracksIds[trackUri] as TrackInfo | undefined;
      if (!trackInfo) return null;

      return {
        timestamp: track.ts,
        platform: track.platform,
        msPlayed: track.ms_played,
        spotifyId: trackUri,
        artistIds: trackInfo.artists,
        albumId: trackInfo.album,
        albumArtistIds: trackInfo.artistsAlbums,
        reasonStart: track.reason_start,
        reasonEnd: track.reason_end,
        shuffle: track.shuffle,
        skipped: track.skipped,
        offline: track.offline,
      };
    })
    .filter((track) => track !== null);

  const chunkTracks = [];
  try {
    const chunkSize = 10000;
    for (let i = 0; i < newTracks.length; i += chunkSize) {
      chunkTracks.push(newTracks.slice(i, i + chunkSize));
    }
  } catch (error) {
    console.error("Error saving tracks:", error as Error);
    return { message: "error", error: "Error saving tracks" };
  }

  await createPackageAction({
    spotify_id: data[0][0].username,
    file_name: file.name,
    file_size: file.size,
  });

  try {
    await Promise.all(
      chunkTracks.map((chunk) =>
        fetch("/api/package/save", {
          method: "POST",
          body: JSON.stringify(chunk),
        }).then((res) => res.json()),
      ),
    );
  } catch (error) {
    await deleteLastPackageAction();
    console.error("Error saving tracks:", error as Error);
    return { message: "error", error: "Error saving tracks" };
  }
};

const filterTrack = (track: DataType) =>
  !track.spotify_track_uri ||
  !track.master_metadata_album_album_name ||
  !track.master_metadata_album_artist_name ||
  !track.master_metadata_album_artist_name ||
  track.ms_played < 5000;
