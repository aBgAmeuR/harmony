import { Album, Artist, db, Playback, Track } from "@/lib/db";
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

    db.delete();
    db.open();

    await saveData(data);

    console.log("artist :", await db.artist.count());
    console.log("album :", await db.album.count());
    console.log("track :", await db.track.count());
    console.log("playback :", await db.playback.count());

    console.timeEnd("Processing time");

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

        // Préparez des tableaux pour stocker les entités à ajouter en batch
        const artistsToAdd: Artist[] = [];
        const albumsToAdd: Album[] = [];
        const tracksToAdd: Track[] = [];
        const playbacksToAdd: Playback[] = [];

        for (const dataArray of data) {
          dataArray.sort((a, b) =>
            a.master_metadata_track_name?.localeCompare(
              b.master_metadata_track_name
            )
          );
          for (const item of dataArray) {
            if (item.ms_played <= 3000 || !item.spotify_track_uri) {
              continue;
            }

            // Gestion de l'artiste
            let artistId = artistMap.get(
              item.master_metadata_album_artist_name
            );
            if (!artistId) {
              artistId = artistsToAdd.length; // Id temporaire
              const newArtist = {
                id: artistId,
                name: item.master_metadata_album_artist_name
              };
              artistsToAdd.push(newArtist);
              artistMap.set(item.master_metadata_album_artist_name, artistId);
            }

            // Gestion de l'album
            const albumKey = `${item.master_metadata_album_album_name}-${artistId}`;
            let albumId = albumMap.get(albumKey);
            if (!albumId) {
              albumId = albumsToAdd.length; // Id temporaire
              const newAlbum = {
                id: albumId,
                name: item.master_metadata_album_album_name,
                artist_id: artistId
              };
              albumsToAdd.push(newAlbum);
              albumMap.set(albumKey, albumId);
            }

            // Gestion du morceau
            const trackKey = `${item.master_metadata_track_name}-${artistId}-${albumId}`;
            let trackId = trackMap.get(trackKey);
            if (!trackId) {
              trackId = tracksToAdd.length; // Id temporaire
              const newTrack = {
                id: trackId,
                name: item.master_metadata_track_name,
                artist_id: artistId,
                album_id: albumId,
                spotify_track_uri: item.spotify_track_uri
              };
              tracksToAdd.push(newTrack);
              trackMap.set(trackKey, trackId);
            }

            // Gestion de la lecture
            const newPlayback = {
              id: playbacksToAdd.length, // Temporary id
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
            };
            playbacksToAdd.push(newPlayback);
          }
        }

        // Ajoutez les entités en batch dans la base de données
        await Promise.all([
          db.artist.bulkAdd(artistsToAdd, { allKeys: true }),
          db.album.bulkAdd(albumsToAdd, { allKeys: true }),
          db.track.bulkAdd(tracksToAdd, { allKeys: true }),
          db.playback.bulkAdd(playbacksToAdd)
        ]);
      }
    );
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}
