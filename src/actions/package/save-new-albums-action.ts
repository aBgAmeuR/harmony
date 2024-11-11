"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSpotifyAlbumsInfo } from "@/lib/spotify";
import { chunkMap } from "@/lib/utils";

type AlbumWithArtist = {
  artist: string;
  title: string;
};

/**
 * Saves new albums to the database.
 * @param newAlbums A map of album titles and Spotify track URIs.
 * @returns An error if the user is not authenticated.
 */
export const saveNewAlbumsAction = async (
  newAlbums: Map<AlbumWithArtist, string>
) => {
  const session = await auth();

  if (!session || !session.user) return new Error("User not authenticated");

  console.log("Saving new albums...", newAlbums);

  const albums = await fetchAlbumsInfo(newAlbums);

  console.log("Albums fetched:", albums.length);

  const artist = await prisma.artist.findMany({
    select: {
      id: true,
      spotifyUri: true
    }
  });

  await prisma.album.createMany({
    data: albums
      .map((album) => {
        if (album.album === null) {
          console.log("Album not found:", album.name);
          return null;
        }

        const spotifyUri = album.album.artists[0].uri.split(":")[2];
        const artistid = artist.find((a) => a.spotifyUri === spotifyUri)?.id;

        if (!artistid) {
          console.log("Artist not found:", album.album.artists[0].name);
          return null;
        }

        return {
          title: album.album.name || album.name,
          spotifyUri: album.album.uri.split(":")[2],
          coverUri: album.album.images[0]?.url,
          href: album.album.href,
          artistid
        };
      })
      .filter((album): album is NonNullable<typeof album> => album !== null),
    skipDuplicates: true
  });
};

const fetchAlbumsInfo = async (albums: Map<AlbumWithArtist, string>) => {
  const albumsChunks = chunkMap(albums, 50);
  const albumsData = await Promise.all(
    albumsChunks.map((chunk) =>
      getSpotifyAlbumsInfo(Array.from(chunk.values()))
    )
  );

  return albumsData.flat();
};
