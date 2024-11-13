"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Spotify } from "@/lib/spotify-obj";
import { Artist, Track } from "@/types/spotify";

/**
 * Saves new tracks to the database.
 * @param newTracks A map of track titles, artists, albums and Spotify track URIs.
 * @returns An error if the user is not authenticated.
 */
export const saveNewArtistsAction = async (tracks: Track[]) => {
  const session = await auth();

  if (!session || !session.user) return new Error("User not authenticated");

  const artistsUris = await getUniqueArtists(tracks);

  const spotify = new Spotify();
  const artists = await spotify.getSpotifyArtistsInfo(new Set(artistsUris));

  await saveArtists(artists);
};

// const fetchArtistsInfo = async (artists: Set<string>) => {
//   const artistsChunks = chunkSet(artists, 50);
//   const artistsData = await Promise.all(
//     artistsChunks.map((chunk) =>
//       getSpotifyArtistsInfo(Array.from(chunk.values()))
//     )
//   );

//   return artistsData.flat();
// };

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
