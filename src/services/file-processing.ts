import { db } from "@/lib/db";
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

    db.delete();
    db.open();

    await saveData(data);

    console.log("artist :", await db.artist.count());
    console.log("album :", await db.album.count());
    console.log("track :", await db.track.count());
    console.log("playback :", await db.playback.count());

    return { message: "ok" };
  } catch (error) {
    console.error("Error processing files:", error as Error);
    return { message: "error", error: (error as Error).toString() };
  }
}

async function saveData(data: DataType[][]) {
  try {
    await db.transaction(
      "rw",
      db.track,
      db.artist,
      db.album,
      db.playback,
      async () => {
        const artistMap = new Map<string, number>();
        const albumMap = new Map<string, number>();
        const trackMap = new Map<string, number>();

        for (const dataArray of data) {
          for (const item of dataArray) {
            if (item.ms_played <= 3000 || !item.spotify_track_uri) {
              continue;
            }

            // Enregistrement de l'artiste
            let artistId = artistMap.get(
              item.master_metadata_album_artist_name
            );
            if (!artistId) {
              artistId = await db.artist.add({
                name: item.master_metadata_album_artist_name
              });
              artistMap.set(item.master_metadata_album_artist_name, artistId);
            }

            // Enregistrement de l'album
            const albumKey = `${item.master_metadata_album_album_name}-${artistId}`;
            let albumId = albumMap.get(albumKey);
            if (!albumId) {
              albumId = await db.album.add({
                name: item.master_metadata_album_album_name,
                artist_id: artistId
              });
              albumMap.set(albumKey, albumId);
            }

            // Enregistrement du morceau
            const trackKey = `${item.master_metadata_track_name}-${artistId}-${albumId}`;
            let trackId = trackMap.get(trackKey);
            if (!trackId) {
              trackId = await db.track.add({
                name: item.master_metadata_track_name,
                artist_id: artistId,
                album_id: albumId,
                spotify_track_uri: item.spotify_track_uri
              });
              trackMap.set(trackKey, trackId);
            }

            // Enregistrement de la lecture
            await db.playback.add({
              timestamp: new Date(item.ts),
              platform: item.platform,
              ms_played: item.ms_played,
              reason_start: item.reason_start,
              reason_end: item.reason_end,
              shuffle: item.shuffle,
              skipped: item.skipped,
              offline: item.offline,
              offline_timestamp: item.offline_timestamp,
              incognito_mode: item.incognito_mode,
              track_id: trackId
            });
          }
          console.log("Data saved successfully");
        }
      }
    );
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}
