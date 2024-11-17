"server-only";

import { prisma } from "@repo/database";
import { AlbumSimplified, Track } from "@repo/spotify/types";

export const saveNewAlbums = async (tracks: Track[]) => {
  const albums = await getUniqueAlbums(tracks);

  if (albums.length <= 0) return;
  console.log("Saving new albums", albums);

  await saveAlbums(albums);
};

const getUniqueAlbums = async (tracks: Track[]) => {
  const albums = await prisma.album.findMany({
    select: {
      spotify_id: true,
    },
  });
  const albumsMap = new Set(albums.map((album) => album.spotify_id));
  const newAlbumsMap = new Map<string, AlbumSimplified>();

  for (const track of tracks) {
    if (!track?.album || !track?.uri || !track.album?.name) continue;
    const uri = track.album.uri.split(":")[2];
    if (!newAlbumsMap.has(uri) && !albumsMap.has(uri)) {
      newAlbumsMap.set(uri, track.album);
    }
  }

  return Array.from(newAlbumsMap.values());
};

const saveAlbums = async (albums: AlbumSimplified[]) => {
  const artistIds = await getAllArtistIds();

  const newAlbums = albums
    .map((album) => {
      if (!album || !album?.id || !album?.name) return null;

      return {
        spotify_id: album.id,
        title: album.name,
        coverUri: album.images[0]?.url,
        href: album?.external_urls?.spotify,
        releaseDate: new Date(album.release_date) || null,
        totalTracks: album.total_tracks,
        artist_ids: album.artists
          .map((artist) => artistIds.get(artist.id))
          .filter((id): id is string => id !== undefined),
      };
    })
    .filter((album) => album !== null);

  await prisma.album.createMany({
    data: newAlbums,
  });
};

const getAllArtistIds = async () => {
  const artists = await prisma.artist.findMany({
    select: { id: true, spotify_id: true },
  });
  return new Map(artists.map((artist) => [artist.spotify_id, artist.id]));
};
