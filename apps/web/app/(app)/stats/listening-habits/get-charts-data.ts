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
      shuffle: "Shuffled",
      fill: "hsl(var(--chart-1))",
      totalPlayed: shuffles.find((s) => s.shuffle)?._count._all || 0,
    },
    {
      shuffle: "Not Shuffled",
      fill: "hsl(var(--chart-6))",
      totalPlayed: shuffles.find((s) => !s.shuffle)?._count._all || 1,
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
      skipped: "Skipped",
      fill: "hsl(var(--chart-1))",
      totalPlayed: skippeds.find((s) => s.skipped)?._count._all || 0,
    },
    {
      skipped: "Not Skipped",
      fill: "hsl(var(--chart-6))",
      totalPlayed: skippeds.find((s) => !s.skipped)?._count._all || 1,
    },
  ];
};

export const getTopPlatforms = async (userId: string | undefined) => {
  const TOP_PLATFORMS_LIMIT = 5;
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const platforms = await prisma.track.groupBy({
    _sum: { msPlayed: true },
    where: {
      userId,
      timestamp: {
        gte: monthRange.dateStart,
        lt: monthRange.dateEnd,
      },
    },
    by: ["platform"],
  });

  const topPlatforms = platforms.sort(
    (a, b) => Number(b._sum.msPlayed ?? 0) - Number(a._sum.msPlayed ?? 0),
  );

  if (topPlatforms.length > TOP_PLATFORMS_LIMIT) {
    const otherMsPlayed = topPlatforms
      .slice(TOP_PLATFORMS_LIMIT)
      .reduce(
        (acc, platform) => acc + BigInt(platform._sum.msPlayed ?? 0),
        BigInt(0),
      );
    topPlatforms.splice(
      TOP_PLATFORMS_LIMIT,
      topPlatforms.length - TOP_PLATFORMS_LIMIT,
      { platform: "Other", _sum: { msPlayed: BigInt(otherMsPlayed) } },
    );
  }

  return topPlatforms.map(({ platform, _sum: { msPlayed } }) => ({
    platform,
    msPlayed: Number(msPlayed),
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
  const listeningHabits = new Array(24)
    .fill(0)
    .map((_, i) => ({ hour: i, msPlayed: 0 }));

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

  const listeningHabits = Array.from({ length: 7 }, (_, i) => ({
    day: new Date(0, 0, i + 1).toLocaleString("en-US", { weekday: "long" }),
    msPlayed: 0,
  }));

  tracks.forEach((track) => {
    const day = new Date(track.timestamp).getDay();
    listeningHabits[day].msPlayed += Number(track.msPlayed);
  });

  return listeningHabits;
};

const getTracks = async (userId: string, dateStart: Date, dateEnd: Date) => {
  return await prisma.track.findMany({
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
