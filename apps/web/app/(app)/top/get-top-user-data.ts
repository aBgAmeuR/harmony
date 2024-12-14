"server-only";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";

const getTimeRangeStats = async (userId: string) => {
  return await prisma.user.findFirst({
    where: { id: userId },
    select: { timeRangeStats: true },
  });
};

export const getTopArtists = async (userId: string | undefined) => {
  if (!userId) return null;

  const timeRangeStats = await getTimeRangeStats(userId);
  if (!timeRangeStats) return null;

  return await spotify.me.top("artists", timeRangeStats.timeRangeStats);
};

export const getTopTracks = async (userId: string | undefined) => {
  if (!userId) return null;

  const timeRangeStats = await getTimeRangeStats(userId);
  if (!timeRangeStats) return null;

  return await spotify.me.top("tracks", timeRangeStats.timeRangeStats);
};
