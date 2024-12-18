"server-only";

import { prisma } from "@repo/database";

import { getMonthRangeAction } from "~/actions/month-range-actions";

export const getShuffleHabit = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const shuffles = await prisma.track.groupBy({
    by: ["shuffle"],
    _count: { _all: true },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
  });

  return [
    {
      shuffled:
        shuffles.find((shuffle) => shuffle.shuffle === true)?._count?._all || 0,
      notShuffled:
        shuffles.find((shuffle) => shuffle.shuffle === false)?._count?._all ||
        1,
    },
  ];
};

export const getSkippedHabit = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const skippeds = await prisma.track.groupBy({
    by: ["skipped"],
    _count: { _all: true },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
  });

  return [
    {
      skipped:
        skippeds.find((shuffle) => shuffle.skipped === true)?._count?._all || 0,
      notSkipped:
        skippeds.find((shuffle) => shuffle.skipped === false)?._count?._all ||
        1,
    },
  ];
};

export const getTopPlatforms = async (userId: string | undefined) => {
  const TOP_PLATFORMS_LIMIT = 4 as const;
  const PLATFORMS = ["windows", "mac", "linux", "android", "ios"] as const;

  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const tracks = await getTracks(
    userId,
    monthRange.dateStart,
    monthRange.dateEnd,
  );
  const platforms = new Map<string, number>();

  tracks.forEach((track) => {
    const trackPlatform = track.platform.trim().toLowerCase();
    const platform =
      PLATFORMS.find((platform) => trackPlatform.includes(platform)) || "Other";
    const currentMsPlayed = platforms.get(platform) ?? 0;
    platforms.set(platform, currentMsPlayed + Number(track.msPlayed));
  });

  const topPlatforms = Array.from(platforms.entries()).sort(
    ([, a], [, b]) => b - a,
  );

  if (topPlatforms.length > TOP_PLATFORMS_LIMIT) {
    const otherMsPlayed = topPlatforms
      .slice(TOP_PLATFORMS_LIMIT)
      .reduce((acc, [, msPlayed]) => acc + msPlayed, 0);
    topPlatforms.splice(
      TOP_PLATFORMS_LIMIT,
      topPlatforms.length - TOP_PLATFORMS_LIMIT,
      ["Other", otherMsPlayed],
    );
  }

  return topPlatforms.map(([platform, msPlayed]) => ({
    platform,
    msPlayed,
  }));
};

export const getHoursHabit = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const tracks = await getTracks(
    userId,
    monthRange.dateStart,
    monthRange.dateEnd,
  );

  const listeningHabits = Array.from({ length: 24 }, (_, i) => {
    return {
      hour: i,
      msPlayed: 0,
    };
  });

  tracks.forEach((track) => {
    const hour = new Date(track.timestamp).getHours();
    listeningHabits[hour].msPlayed += Number(track.msPlayed);
  });

  return listeningHabits;
};

export const getDaysHabit = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const tracks = await getTracks(
    userId,
    monthRange.dateStart,
    monthRange.dateEnd,
  );

  const listeningHabits = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  tracks.forEach((track) => {
    const day = new Date(track.timestamp).getDay();
    switch (day) {
      case 0:
        listeningHabits.Sunday += Number(track.msPlayed);
        break;
      case 1:
        listeningHabits.Monday += Number(track.msPlayed);
        break;
      case 2:
        listeningHabits.Tuesday += Number(track.msPlayed);
        break;
      case 3:
        listeningHabits.Wednesday += Number(track.msPlayed);
        break;
      case 4:
        listeningHabits.Thursday += Number(track.msPlayed);
        break;
      case 5:
        listeningHabits.Friday += Number(track.msPlayed);
        break;
      case 6:
        listeningHabits.Saturday += Number(track.msPlayed);
        break;
    }
  });

  return Object.entries(listeningHabits).map(([day, msPlayed]) => ({
    day,
    msPlayed,
  }));
};

const getTracks = async (userId: string, dateStart: Date, dateEnd: Date) => {
  return prisma.track.findMany({
    where: {
      userId,
      timestamp: {
        gte: dateStart,
        lt: dateEnd,
      },
    },
    select: {
      timestamp: true,
      msPlayed: true,
      platform: true,
    },
  });
};
