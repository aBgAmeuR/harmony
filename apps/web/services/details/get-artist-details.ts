"server-only";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";
import { Album, Track } from "@repo/spotify/types";

import { getMsPlayedInMinutes } from "~/lib/utils";

type ItemType = "track" | "album";
type TopItem = {
  _sum: bigint;
  _count: number;
};
type TopItemWithAlbumId = TopItem & { albumId: string };

const formatItem = (
  item: Track | Album,
  topItem: TopItem | undefined,
  type: ItemType,
) => {
  const msPlayed = Number(topItem?._sum) || 0;
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
    stat2: `${topItem?._count || 0} streams`,
  };
};

export async function getArtistDetails(userId: string | undefined, id: string) {
  if (!userId) return null;

  const topTracksQuery = prisma.track.groupBy({
    by: ["spotifyId"],
    _count: true,
    _sum: { msPlayed: true },
    where: {
      userId,
      OR: [{ artistIds: { has: id } }, { albumArtistIds: { has: id } }],
    },
    orderBy: { _sum: { msPlayed: "desc" } },
    take: 22,
  });

  const topAlbumsQuery = prisma.$queryRaw<TopItemWithAlbumId[]>`
    SELECT "albumId", COUNT(*) as _count, SUM("msPlayed") as _sum
    FROM "Track"
    WHERE "userId" = ${userId} AND ("albumArtistIds"::text[] @> ARRAY[${id}]::text[])
    GROUP BY "albumId"
    HAVING COUNT(DISTINCT "spotifyId") >= 2
    ORDER BY _sum DESC
    LIMIT 10
  `;

  const [topTracks, topAlbums] = await prisma.$transaction([
    topTracksQuery,
    topAlbumsQuery,
  ]);

  const [tracksInfos, albumsInfos] = await Promise.all([
    spotify.tracks.list(topTracks.map((track) => track.spotifyId)),
    spotify.albums.list(topAlbums.map((album) => album.albumId)),
  ]);

  const tracks = tracksInfos.map((track) => {
    const findTrack = topTracks.find(
      (topTrack) => topTrack.spotifyId === track.id,
    );

    return formatItem(
      track,
      {
        _sum: findTrack?._sum.msPlayed || BigInt(0),
        _count: findTrack?._count || 0,
      },
      "track",
    );
  });

  const albums = (() => {
    // Group albums with the same name
    const albumGroups: Record<
      string,
      {
        base: (typeof albumsInfos)[number];
        totalMs: bigint;
        totalCount: number;
      }
    > = {};
    for (const album of albumsInfos) {
      const key = album.name ?? "";
      const stats = topAlbums.find(
        (topAlbum) => topAlbum.albumId === album.id,
      ) || { _sum: null, _count: 0 };
      const statSum =
        stats._sum !== null && stats._sum !== undefined
          ? BigInt(stats._sum)
          : BigInt(0);
      if (!albumGroups[key]) {
        albumGroups[key] = {
          base: album,
          totalMs: statSum,
          totalCount: stats._count || 0,
        };
      } else {
        albumGroups[key].totalMs += statSum;
        albumGroups[key].totalCount += stats._count || 0;
      }
    }
    return Object.values(albumGroups).map(({ base, totalMs, totalCount }) => {
      return formatItem(base, { _sum: totalMs, _count: totalCount }, "album");
    });
  })();

  return {
    tracks,
    albums,
  };
}
