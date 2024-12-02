"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";

export const getRankingArtistsAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }

  const topArtists = await prisma.track.groupBy({
    by: ["artistIds"],
    _count: {
      _all: true,
    },
    _sum: {
      msPlayed: true,
    },
    where: {
      userId: session.user.id,
      timestamp: {
        gte: minDate,
        lt: maxDate,
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
