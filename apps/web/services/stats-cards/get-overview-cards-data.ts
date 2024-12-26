"server-only";

import { prisma } from "@repo/database";

import { getMonthRangeAction } from "~/actions/month-range-actions";

export const getOverviewCardsData = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const listeningTimeQuery = prisma.track.aggregate({
    _sum: { msPlayed: true },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
  });

  const totalPlaysQuery = prisma.track.count({
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
  });

  const uniqueArtistsQuery = prisma.track.groupBy({
    by: ["artistIds"],
    _count: { _all: true },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
  });

  const mostActiveDayQuery = prisma.track.groupBy({
    by: ["timestamp"],
    _sum: { msPlayed: true },
    _count: { _all: true },
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
    take: 1,
  });

  const [listeningTime, totalPlays, uniqueArtists, mostActiveDay] =
    await Promise.all([
      listeningTimeQuery,
      totalPlaysQuery,
      uniqueArtistsQuery,
      mostActiveDayQuery,
    ]);

  const totalPlaysPerDay =
    totalPlays /
    ((monthRange.dateEnd.getTime() - monthRange.dateStart.getTime()) /
      (1000 * 60 * 60 * 24));

  return {
    listeningTime: Number(listeningTime?._sum?.msPlayed) || 0,
    totalPlays: totalPlays || 0,
    totalPlaysPerDay: Math.round(totalPlaysPerDay) || 0,
    uniqueArtists: uniqueArtists.length || 0,
    mostActiveDay: {
      day: mostActiveDay[0]?.timestamp,
      timePlayed: Number(mostActiveDay[0]?._sum?.msPlayed) || 0,
      totalPlayed: mostActiveDay[0]?._count?._all || 0,
    },
  };
};
