"server-only";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";

import { getMonthRangeAction } from "~/actions/month-range-actions";
import { getMsPlayedInMinutes } from "~/lib/utils";

export const getRankingTracks = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const topTracks = await prisma.track.groupBy({
    by: ["spotifyId"],
    _count: { _all: true },
    _sum: { msPlayed: true },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
    orderBy: { _sum: { msPlayed: "desc" } },
    take: 50,
  });

  const tracksInfos = await spotify.tracks.list(
    topTracks.map((track) => track.spotifyId),
  );

  return tracksInfos.map((track) => {
    const topTrack = topTracks.find(
      (topTrack) => topTrack.spotifyId === track.id,
    );
    const msPlayed = Number(topTrack?._sum.msPlayed) || 0;
    return {
      id: track.id,
      href: track.external_urls.spotify,
      image: track.album.images[0].url,
      name: track.name,
      artists: track.artists.map((artist) => artist.name).join(", "),
      stat1: `${getMsPlayedInMinutes(msPlayed)} minutes`,
      stat2: `${topTrack?._count?._all || 0} streams`,
    };
  });
};

export const getRankingArtists = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const topArtists = await prisma.track.groupBy({
    by: ["artistIds"],
    _count: {
      _all: true,
    },
    _sum: {
      msPlayed: true,
    },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
    orderBy: {
      _sum: {
        msPlayed: "desc",
      },
    },
  });

  const aggregatedArtists: Record<
    string,
    { totalMsPlayed: bigint; trackCount: number }
  > = {};

  topArtists.forEach((entry) => {
    entry.artistIds.forEach((artistId) => {
      if (!aggregatedArtists[artistId]) {
        aggregatedArtists[artistId] = {
          totalMsPlayed: BigInt(0),
          trackCount: 0,
        };
      }

      aggregatedArtists[artistId].totalMsPlayed +=
        entry._sum.msPlayed || BigInt(0);
      aggregatedArtists[artistId].trackCount += entry._count._all;
    });
  });

  const sortedArtists = Object.entries(aggregatedArtists)
    .map(([artistId, stats]) => ({
      artistId,
      totalMsPlayed: stats.totalMsPlayed,
      trackCount: stats.trackCount,
    }))
    .sort((a, b) => Number(b.totalMsPlayed - a.totalMsPlayed))
    .slice(0, 50);

  const artistsInfos = await spotify.artists.list(
    sortedArtists.map((artist) => artist.artistId),
  );

  return artistsInfos.map((artist) => {
    const topartist = sortedArtists.find(
      (topArtist) => topArtist.artistId === artist.id,
    );
    const msPlayed = Number(topartist?.totalMsPlayed) || 0;
    return {
      id: artist.id,
      href: artist.external_urls.spotify,
      image: artist.images[0]?.url,
      name: artist.name,
      stat1: `${getMsPlayedInMinutes(msPlayed)} minutes`,
      stat2: `${topartist?.trackCount || 0} streams`,
    };
  });
};

export const getRankingAlbums = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const topAlbums = await prisma.track.groupBy({
    by: ["albumId"],
    _count: {
      _all: true,
    },
    _sum: {
      msPlayed: true,
    },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
    orderBy: {
      _sum: {
        msPlayed: "desc",
      },
    },
    take: 50,
  });

  const albumIds = topAlbums.map((album) => album.albumId);
  const albumsInfos = await spotify.albums.list(albumIds);

  return albumsInfos.map((album) => {
    const topAlbum = topAlbums.find(
      (topAlbum) => topAlbum.albumId === album.id,
    );
    const msPlayed = Number(topAlbum?._sum.msPlayed) || 0;
    return {
      id: album.id,
      href: album.external_urls.spotify,
      image: album.images[0].url,
      name: album.name || "Unknown album",
      artists: album.artists.map((artist) => artist.name).join(", "),
      stat1: `${getMsPlayedInMinutes(msPlayed)} minutes`,
      stat2: `${topAlbum?._count?._all || 0} streams`,
    };
  });
};
