"server-only";

import { prisma } from "@repo/database";
import { Track } from "@repo/spotify/types";

export const saveNewTracks = async (tracks: Track[]) => {
  const uniqueTracks = await getUniqueTracks(tracks);

  if (uniqueTracks.length <= 0) return;
  console.log("Saving new tracks:", uniqueTracks);

  await saveTracks(uniqueTracks);
};

const getUniqueTracks = async (newTracks: Track[]) => {
  const tracks = await prisma.track.findMany({
    select: {
      spotify_id: true,
    },
  });
  const tracksMap = new Set(tracks.map((track) => track.spotify_id));
  const newTracksMap = new Map<string, Track>();

  for (const track of newTracks) {
    if (!track?.album || !track?.uri || !track?.name) continue;
    const uri = track.album.uri.split(":")[2];
    if (!newTracksMap.has(uri) && !tracksMap.has(uri)) {
      newTracksMap.set(uri, track);
    }
  }

  return Array.from(newTracksMap.values());
};

const saveTracks = async (tracks: Track[]) => {
  const artistIds = await getAllArtistIds();
  const albumIds = await getAllAlbumIds();

  const newTracks = tracks
    .map((track) => {
      if (!track || !track?.id || !track?.name) return null;

      const albumId = albumIds.get(track.album.id);
      if (!albumId) return null;

      return {
        spotify_id: track.id,
        title: track.name,
        href: track?.external_urls?.spotify,
        duration: track.duration_ms,
        track_number: track.track_number,
        artist_ids: track.artists
          .map((artist) => artistIds.get(artist.id))
          .filter((id): id is string => id !== undefined),
        albumid: albumId,
      };
    })
    .filter((track) => track !== null);

  await prisma.track.createMany({
    data: newTracks,
  });
};

const getAllArtistIds = async () => {
  const artists = await prisma.artist.findMany({
    select: { id: true, spotify_id: true },
  });
  return new Map(artists.map((artist) => [artist.spotify_id, artist.id]));
};

const getAllAlbumIds = async () => {
  const albums = await prisma.album.findMany({
    select: { id: true, spotify_id: true },
  });
  return new Map(albums.map((album) => [album.spotify_id, album.id]));
};
