"server-only";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";

import { getMonthRangeAction } from "~/actions/month-range-actions";

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
    return {
      id: track.id,
      name: track.name,
      href: track.external_urls.spotify,
      duration: track.duration_ms,
      artists: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      releaseDate: track.album.release_date,
      cover: track.album.images[0].url,
      totalPlayed: topTrack?._count?._all || 0,
      msPlayed: topTrack?._sum?.msPlayed ? Number(topTrack._sum.msPlayed) : 0,
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

  // Parcourir les résultats et agréger les données
  topArtists.forEach((entry) => {
    // Parcourir chaque artiste dans `artistIds` (car il peut y en avoir plusieurs)
    entry.artistIds.forEach((artistId) => {
      if (!aggregatedArtists[artistId]) {
        // Si l'artiste n'existe pas encore, initialiser son objet
        aggregatedArtists[artistId] = {
          totalMsPlayed: BigInt(0),
          trackCount: 0,
        };
      }

      // Ajouter la durée de lecture et incrémenter le nombre de pistes pour cet artiste
      aggregatedArtists[artistId].totalMsPlayed +=
        entry._sum.msPlayed || BigInt(0);
      aggregatedArtists[artistId].trackCount += entry._count._all;
    });
  });

  // Convertir le résultat en un tableau trié par `totalMsPlayed`
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
    return {
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url,
      msPlayed: Number(topartist?.totalMsPlayed),
      totalPlayed: topartist?.trackCount || 0,
      href: artist.external_urls.spotify,
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
    return {
      id: album.id,
      name: album.name || "Unknown",
      href: album.external_urls.spotify,
      releaseDate: album.release_date,
      cover: album.images[0].url,
      totalPlayed: topAlbum?._count?._all || 0,
      msPlayed: topAlbum?._sum?.msPlayed ? Number(topAlbum._sum.msPlayed) : 0,
      artists: album.artists.map((artist) => artist.name).join(", "),
    };
  });
};
