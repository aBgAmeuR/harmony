"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSpotifyArtistsInfo } from "@/lib/spotify";
import { chunkMap } from "@/lib/utils";

/**
 * Saves new artists to the database.
 * @param newArtists A map of artist names and Spotify track URIs.
 * @returns An error if the user is not authenticated.
 */
export const saveNewArtistsAction = async (newArtists: Map<string, string>) => {
  const session = await auth();

  if (!session || !session.user) return new Error("User not authenticated");

  console.log("Saving new artists...", newArtists);

  const artists = await fetchArtistsInfo(newArtists);

  console.log("Artists fetched:", artists.length);

  await prisma.artist.createMany({
    data: artists.map((artist) => ({
      name: artist.name,
      spotifyUri: artist.uri.split(":")[2],
      coverUri: artist.images[0]?.url,
      href: artist.href
    })),
    skipDuplicates: true
  });
};

const fetchArtistsInfo = async (artists: Map<string, string>) => {
  const artistsChunks = chunkMap(artists, 50);
  const artistsData = await Promise.all(
    artistsChunks.map((chunk) =>
      getSpotifyArtistsInfo(Array.from(chunk.values()))
    )
  );

  return artistsData.flat();
};
