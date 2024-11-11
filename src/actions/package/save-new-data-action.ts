"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSpotifyArtistsInfo, getSpotifyTracksInfo } from "@/lib/spotify";
import { chunkSet } from "@/lib/utils";
import { AlbumSimplified, Artist, Track } from "@/types/spotify";

/**
 * Saves new tracks to the database.
 * @param newTracks A map of track titles, artists, albums and Spotify track URIs.
 * @returns An error if the user is not authenticated.
 */
export const saveNewDataAction = async (newTracks: Set<string>) => {
  const session = await auth();

  if (!session || !session.user) return new Error("User not authenticated");

  const tracks = await fetchTracksInfo(newTracks);

  // const albums = await getUniqueAlbums(tracks);
  // const artistsUris = await getUniqueArtists(tracks);

  // const artists = await fetchArtistsInfo(new Set(artistsUris));

  // await saveArtists(artists);
  await saveTracks(tracks);
};

const fetchTracksInfo = async (tracks: Set<string>) => {
  // const tracksChunks = chunkSet(tracks, 50);
  // const tracksData = await Promise.all(
  //   tracksChunks.map((chunk) =>
  //     getSpotifyTracksInfo(Array.from(chunk.values()))
  //   )
  // );

  // return tracksData.flat();

  return await getSpotifyTracksInfo(Array.from(tracks).slice(0, 50));
};

const fetchArtistsInfo = async (artists: Set<string>) => {
  const artistsChunks = chunkSet(artists, 50);
  const artistsData = await Promise.all(
    artistsChunks.map((chunk) =>
      getSpotifyArtistsInfo(Array.from(chunk.values()))
    )
  );

  return artistsData.flat();
};

const getUniqueAlbums = async (tracks: Track[]) => {
  const albums = await prisma.album.findMany({
    select: {
      id: true
    }
  });
  const albumsMap = new Set(albums.map((album) => album.id));
  const newAlbumsMap = new Map<string, AlbumSimplified>();

  for (const track of tracks) {
    if (!track?.album || !track?.uri) continue;
    const album = track.album;
    if (!newAlbumsMap.has(album.uri) && !albumsMap.has(album.uri)) {
      newAlbumsMap.set(album.uri, album);
    }
  }

  return Array.from(newAlbumsMap.values());
};

const getUniqueArtists = async (tracks: Track[]) => {
  const artists = await prisma.artist.findMany({
    select: {
      id: true
    }
  });
  const artistsMap = new Set(artists.map((artist) => artist.id));
  const newArtistsMap = new Set<string>();

  for (const track of tracks) {
    if (!track?.artists || !track?.uri) continue;
    for (const artist of track.artists) {
      const uri = artist.uri.split(":")[2];
      if (!newArtistsMap.has(uri) && !artistsMap.has(uri)) {
        newArtistsMap.add(uri);
      }
    }
  }

  return Array.from(newArtistsMap);
};

const saveArtists = async (artists: Artist[]) => {
  await prisma.artist.createMany({
    data: artists
      .map((artist) => {
        if (!artist || !artist?.id || !artist?.name) return null;

        return {
          id: artist.id,
          name: artist.name,
          coverUri: artist.images[0]?.url,
          href: artist?.external_urls?.spotify,
          genres: artist.genres || []
        };
      })
      .filter((artist): artist is NonNullable<typeof artist> => artist !== null)
  });
};

const saveTracks = async (tracks: Track[]) => {
  for (const track of tracks) {
    if (
      !track ||
      !track?.id ||
      !track?.name ||
      !track?.artists ||
      !track?.album?.name
    )
      continue;

    await prisma.track.create({
      data: {
        id: track.id,
        title: track.name,
        href: track?.external_urls?.spotify,
        duration: track.duration_ms,
        track_number: track.track_number,
        album: {
          connectOrCreate: {
            where: { id: track.album.id },
            create: {
              id: track.album.id,
              title: track.album.name,
              coverUri: track.album.images[0]?.url,
              href: track?.external_urls?.spotify,
              releaseDate: new Date(track.album.release_date) || null,
              totalTracks: track.album.total_tracks,
              artists: {
                connect: track.album.artists.map((artist) => ({
                  id: artist.id
                }))
              }
            }
          }
        },
        artists: {
          connect: track.artists.map((artist) => ({ id: artist.id }))
        }
      }
    });
  }
};
// const saveAlbums = async (albums: AlbumSimplified[]) => {
//   const res = await prisma.album.createMany({
//     data: albums
//       .map((album) => {
//         if (
//           !album ||
//           !album?.id ||
//           !album?.name ||
//           !album?.artists ||
//           album?.artists.length <= 0
//         )
//           return null;

//         return {
//           id: album.id,
//           title: album.name,
//           coverUri: album.images[0]?.url,
//           href: album?.external_urls?.spotify,
//           releaseDate: new Date(album?.release_date) || null,
//           totalTracks: album?.total_tracks,
//           artists: {
//             connect: album.artists.map((artist) => ({ id: artist.id }))
//           }
//         };
//       })
//       .filter((album): album is NonNullable<typeof album> => album !== null)
//   });

//   console.log("Albums saved", res);
// };
