"server-only";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";
import { Artist, Track } from "@repo/spotify/types";

export const saveNewArtists = async (tracks: Track[]) => {
  const artistsUris = await getUniqueArtists(tracks);

  if (artistsUris.length <= 0) return;

  const artists = await spotify.artists.list(artistsUris);
  await saveArtists(artists);
};

const getUniqueArtists = async (tracks: Track[]) => {
  const artists = await prisma.artist.findMany({
    select: {
      spotify_id: true,
    },
  });
  const artistsMap = new Set(artists.map((artist) => artist.spotify_id));
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
  const newArtists = artists
    .map((artist) => {
      if (!artist || !artist?.id || !artist?.name) return null;

      return {
        spotify_id: artist.id,
        name: artist.name,
        coverUri: artist.images[0]?.url,
        href: artist?.external_urls?.spotify,
        genres: artist.genres || [],
      };
    })
    .filter((artist) => artist !== null);

  await prisma.artist.createMany({
    data: newArtists,
  });
};
