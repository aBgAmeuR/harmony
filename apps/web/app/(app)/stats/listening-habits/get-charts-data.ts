"server-only";

import { prisma } from "@repo/database";

import { getMonthRange } from "~/lib/utils-server";

export const getShuffleHabit = async (
  userId: string | undefined,
  isDemo: boolean,
) => {
  if (!userId) return null;

  const monthRange = await getMonthRange(userId, isDemo);
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

export const getSkippedHabit = async (
  userId: string | undefined,
  isDemo: boolean,
) => {
  if (!userId) return null;

  const monthRange = await getMonthRange(userId, isDemo);
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

export const getTopPlatforms = async (
  userId: string | undefined,
  isDemo: boolean,
) => {
  const TOP_PLATFORMS_LIMIT = 4 as const;

  if (!userId) return null;

  const monthRange = await getMonthRange(userId, isDemo);
  if (!monthRange) return null;

  const data: { platform: string; msPlayed: bigint }[] = await prisma.$queryRaw`
    WITH platform_data AS (
      SELECT
        CASE
          WHEN LOWER(TRIM(platform)) LIKE '%windows%' THEN 'windows'
          WHEN LOWER(TRIM(platform)) LIKE '%mac%' THEN 'mac'
          WHEN LOWER(TRIM(platform)) LIKE '%linux%' THEN 'linux'
          WHEN LOWER(TRIM(platform)) LIKE '%android%' THEN 'android'
          WHEN LOWER(TRIM(platform)) LIKE '%ios%' THEN 'ios'
          ELSE 'Other'
        END AS platform,
        SUM("msPlayed") AS "msPlayed"
      FROM "Track"
      WHERE "userId" = ${userId}
        AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
      GROUP BY platform
    )
    SELECT platform, SUM("msPlayed") AS "msPlayed"
    FROM platform_data
    GROUP BY platform
    ORDER BY "msPlayed" DESC
    LIMIT ${TOP_PLATFORMS_LIMIT + 1}
  `;

  if (!data.length) return [{ platform: "Other", msPlayed: 1 }];

  const topPlatforms = data.slice(0, TOP_PLATFORMS_LIMIT);
  const otherMsPlayed = data
    .slice(TOP_PLATFORMS_LIMIT)
    .reduce((acc, { msPlayed }) => acc + Number(msPlayed), 0);

  if (otherMsPlayed > 0) {
    topPlatforms.push({ platform: "Other", msPlayed: BigInt(otherMsPlayed) });
  }

  return topPlatforms.map(({ platform, msPlayed }) => ({
    platform,
    msPlayed: Number(msPlayed),
  }));
};

export const getHoursHabit = async (
  userId: string | undefined,
  isDemo: boolean,
) => {
  if (!userId) return null;

  const monthRange = await getMonthRange(userId, isDemo);
  if (!monthRange) return null;

  const data: { hour: bigint; time: bigint }[] = await prisma.$queryRaw`
    SELECT
      EXTRACT(HOUR FROM timestamp) AS hour,
      SUM("msPlayed") AS time
    FROM "Track"
    WHERE "userId" = ${userId}
      AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
    GROUP BY hour
    ORDER BY hour ASC
  `;

  const listeningHabits = Array.from({ length: 24 }, (_, i) => {
    return {
      hour: i,
      msPlayed: 0,
    };
  });

  return listeningHabits.map((habit) => {
    const dataItem = data.find((d) => Number(d.hour) === habit.hour);
    return {
      hour: habit.hour,
      msPlayed: dataItem ? Number(dataItem.time) : 0,
    };
  });
};

export const getDaysHabit = async (
  userId: string | undefined,
  isDemo: boolean,
) => {
  if (!userId) return null;

  const monthRange = await getMonthRange(userId, isDemo);
  if (!monthRange) return null;

  const data: { day: bigint; time: bigint }[] = await prisma.$queryRaw`
    SELECT
      EXTRACT(DOW FROM timestamp) AS day,
      SUM("msPlayed") AS time
    FROM "Track"
    WHERE "userId" = ${userId}
      AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
    GROUP BY day
  `;

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return daysOfWeek.map((day, index) => {
    const dataItem = data.find((d) => Number(d.day) === index);
    return {
      day,
      msPlayed: dataItem ? Number(dataItem.time) : 0,
    };
  });
};
