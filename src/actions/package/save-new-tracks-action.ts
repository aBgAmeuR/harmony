"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSpotifyTracksInfo } from "@/lib/spotify";
import { chunkMap } from "@/lib/utils";

type TrackWithArtist = {
  artist: string;
  album: string;
  title: string;
};

/**
 * Saves new tracks to the database.
 * @param newTracks A map of track titles, artists, albums and Spotify track URIs.
 * @returns An error if the user is not authenticated.
 */
export const saveNewTracksAction = async (
  newTracks: Map<TrackWithArtist, string>
) => {
  const session = await auth();

  if (!session || !session.user) return new Error("User not authenticated");

  console.log("Saving new tracks...", newTracks);

  const tracks = await fetchTracksInfo(newTracks);

  console.log("Tracks fetched:", tracks.length);

  const album = await prisma.album.findMany({
    select: {
      id: true,
      spotifyUri: true,
      artist: {
        select: {
          id: true
        }
      }
    }
  });

  await prisma.track.createMany({
    data: tracks
      .map((track) => {
        const spotifyAlbumUri = track.album.uri.split(":")[2];
        const albumid = album.find((a) => a.spotifyUri === spotifyAlbumUri)?.id;

        if (!albumid) {
          console.log("Album not found:", {
            albumName: track.album.name,
            title: track.name,
            artist: track.artists,
            album: spotifyAlbumUri
          });
          return null;
        }

        return {
          title: track.name,
          spotifyUri: track.uri.split(":")[2],
          href: track.href,
          albumid
        };
      })
      .filter((track): track is NonNullable<typeof track> => track !== null),
    skipDuplicates: true
  });
};

const fetchTracksInfo = async (tracks: Map<TrackWithArtist, string>) => {
  const tracksChunks = chunkMap(tracks, 50);
  const tracksData = await Promise.all(
    tracksChunks.map((chunk) =>
      getSpotifyTracksInfo(Array.from(chunk.values()))
    )
  );

  return tracksData.flat();
};
