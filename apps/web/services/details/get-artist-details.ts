"server-only";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";
import { Album, Track } from "@repo/spotify/types";

import { getMsPlayedInMinutes } from "~/lib/utils";

type ItemType = "track" | "album";
type TopItem = {
  _sum: { msPlayed: BigInt | null };
  _count: { _all: number | null };
};

const formatItem = (
  item: Track | Album,
  topItem: TopItem | undefined,
  type: ItemType,
) => {
  const msPlayed = Number(topItem?._sum.msPlayed) || 0;
  return {
    id: item.id,
    href: item.external_urls.spotify,
    image:
      type === "track"
        ? (item as Track).album.images[0].url
        : (item as Album).images[0].url,
    name: item.name || `Unknown ${type}`,
    artists: item.artists.map((artist) => artist.name).join(", "),
    stat1: `${getMsPlayedInMinutes(msPlayed)} minutes`,
    stat2: `${topItem?._count?._all || 0} streams`,
  };
};

export async function getArtistDetails(userId: string | undefined, id: string) {
  if (!userId) return null;

  const topTracksQuery = prisma.track.groupBy({
    by: ["spotifyId"],
    _count: { _all: true },
    _sum: { msPlayed: true },
    where: {
      userId,
      OR: [{ artistIds: { has: id } }, { albumArtistIds: { has: id } }],
    },
    orderBy: { _sum: { msPlayed: "desc" } },
    take: 50,
  });

  const topAlbumsQuery = prisma.track.groupBy({
    by: ["albumId"],
    _count: { _all: true },
    _sum: { msPlayed: true },
    where: {
      userId,
      OR: [{ albumArtistIds: { has: id } }],
    },
    orderBy: { _sum: { msPlayed: "desc" } },
    take: 50,
  });

  const [topTracks, topAlbums] = await prisma.$transaction([
    topTracksQuery,
    topAlbumsQuery,
  ]);

  const [tracksInfos, albumsInfos] = await Promise.all([
    spotify.tracks.list(topTracks.map((track) => track.spotifyId)),
    spotify.albums.list(topAlbums.map((album) => album.albumId)),
  ]);

  const tracks = tracksInfos.map((track) => {
    return formatItem(
      track,
      topTracks.find((topTrack) => topTrack.spotifyId === track.id),
      "track",
    );
  });

  const albums = albumsInfos.map((album) => {
    return formatItem(
      album,
      topAlbums.find((topAlbum) => topAlbum.albumId === album.id),
      "album",
    );
  });

  return {
    tracks,
    albums,
  };
}
