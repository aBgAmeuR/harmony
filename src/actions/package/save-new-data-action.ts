"use server";

import { saveNewArtistsAction } from "./save-new-artists-action";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSpotifyTracksInfo } from "@/lib/spotify";
import { chunkSet } from "@/lib/utils";
import { Track } from "@/types/spotify";

/**
 * Saves new tracks to the database.
 * @param newTracks A map of track titles, artists, albums and Spotify track URIs.
 * @returns An error if the user is not authenticated.
 */
export const saveNewDataAction = async (newTracks: Set<string>) => {
  const session = await auth();

  if (!session || !session.user) return new Error("User not authenticated");

  const tracks = await fetchTracksInfo(newTracks);

  await saveNewArtistsAction(tracks);
  await saveTracks(tracks);
};

const fetchTracksInfo = async (tracks: Set<string>) => {
  const tracksChunks = chunkSet(tracks, 50);
  const tracksData = await Promise.all(
    tracksChunks.map((chunk) =>
      getSpotifyTracksInfo(Array.from(chunk.values()))
    )
  );

  return tracksData.flat();
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
