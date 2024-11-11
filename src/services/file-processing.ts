import { getAllTracksAction } from "@/actions/package/get-all-tracks-action";
import { saveNewDataAction } from "@/actions/package/save-new-data-action";
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

    if (!tracks.has(trackUri) && !newTracks.has(trackUri)) {
      newTracks.add(trackUri);
    }
  }

  await saveNewDataAction(newTracks);
};

// const processArtists = async (data: DataType[][]) => {
//   const newArtists = new Map<string, string>();
//   const artists = await getAllArtistsAction();

//   if (!artists) {
//     console.error("Failed to fetch artists");
//     return;
//   }

//   for (const artist of data.flat()) {
//     if (
//       !artists.has(artist.master_metadata_album_artist_name) &&
//       artist.spotify_track_uri
//     ) {
//       newArtists.set(
//         artist.master_metadata_album_artist_name,
//         artist.spotify_track_uri.split(":")[2]
//       );
//     }
//   }

//   if (newArtists.size < 0) return;

//   const chunkedArtists = chunkMap(newArtists, 5000);
//   for (const chunk of chunkedArtists) {
//     await saveNewArtistsAction(chunk);
//   }
// };

// const processAlbums = async (data: DataType[][]) => {
//   const newAlbums = new Map<string, string>();
//   const albums = await getAllAlbumsAction();

//   if (!albums) {
//     console.error("Failed to fetch albums");
//     return;
//   }

//   for (const album of data.flat()) {
//     if (!album.spotify_track_uri) continue;

//     const key = `${album.master_metadata_album_artist_name}::${album.master_metadata_album_album_name}`;
//     if (!albums.has(key)) {
//       newAlbums.set(key, album.spotify_track_uri.split(":")[2]);
//     }
//   }

//   if (newAlbums.size < 0) return;

//   const chunkedAlbums = chunkMap(newAlbums, 5000);
//   for (const chunk of chunkedAlbums) {
//     const transformedChunk = new Map(
//       Array.from(chunk.entries()).map(([key, value]) => {
//         const [artist, title] = key.split("::");
//         return [{ artist, title }, value];
//       })
//     );
//     await saveNewAlbumsAction(transformedChunk);
//   }
// };

// const processTracks = async (data: DataType[][]) => {
//   const newTracks = new Map<string, string>();
//   const tracks = await getAllTracksAction();

//   if (!tracks) {
//     console.error("Failed to fetch tracks");
//     return;
//   }

//   for (const track of data.flat()) {
//     if (!track.spotify_track_uri) continue;

//     const key = `${track.master_metadata_album_artist_name}::${track.master_metadata_album_album_name}::${track.master_metadata_track_name}`;
//     if (!tracks.has(key)) {
//       newTracks.set(key, track.spotify_track_uri.split(":")[2]);
//     }
//   }

//   if (newTracks.size < 0) return;

//   const chunkedTracks = chunkMap(newTracks, 5000);
//   for (const chunk of chunkedTracks) {
//     const transformedChunk = new Map(
//       Array.from(chunk.entries()).map(([key, value]) => {
//         const [artist, album, title] = key.split("::");
//         return [{ artist, album, title }, value];
//       })
//     );
//     await saveNewTracksAction(transformedChunk);
//   }
// };
