"server-only";

import { prisma } from "@repo/database";
import { format, localeFormat } from "light-date";

import { getMonthRangeAction } from "~/actions/month-range-actions";

const formatMonth = (date: Date) =>
  `${localeFormat(date, "{MMM}")} ${format(date, "{yyyy}")}`;

const aggregateData = (
  items: Array<{ timestamp: Date }>,
  // eslint-disable-next-line no-unused-vars
  keyExtractor: (item: any) => string,
) => {
  const aggregated = items.reduce<Record<string, number>>((acc, item) => {
    const key = keyExtractor(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const result = Object.entries(aggregated).map(([key, value]) => ({
    key,
    value,
  }));

  for (let i = 1; i < result.length; i++) {
    result[i].value += result[i - 1].value;
  }

  return result;
};

export const getMonthlyData = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const tracks = await prisma.$queryRaw<
    { month: string; totalmsplayed: number }[]
  >`
    SELECT TO_CHAR(timestamp, 'YYYY-MM') as month, SUM("msPlayed") as totalmsplayed
    FROM "Track"
    WHERE "userId" = ${userId} 
      AND "timestamp" >= ${monthRange.dateStart} 
      AND "timestamp" < ${monthRange.dateEnd}
    GROUP BY month
    ORDER BY month ASC
  `;

  const data: Record<string, number> = {};
  let totalMsPlayed = 0;

  tracks.forEach((track) => {
    const date = new Date(track.month);
    const key = formatMonth(date);
    data[key] = Number(track.totalmsplayed);
    totalMsPlayed += Number(track.totalmsplayed);
  });

  const average = totalMsPlayed / tracks.length;

  return {
    data: Object.entries(data).map(([key, value]) => ({
      month: key,
      value,
    })),
    average: Math.round(average) || 0,
  };
};

export const getMonthlyPlatformData = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const platforms = await prisma.$queryRaw<
    { month: string; platform: string; totalmsplayed: number }[]
  >`
    SELECT TO_CHAR(timestamp, 'YYYY-MM') as month, "platform", SUM("msPlayed") as totalmsplayed
    FROM "Track"
    WHERE "userId" = ${userId} 
      AND "timestamp" >= ${monthRange.dateStart} 
      AND "timestamp" < ${monthRange.dateEnd}
    GROUP BY month, platform
    ORDER BY month ASC
  `;

  const PLATFORMS: Record<"web" | "mobile" | "desktop", string[]> = {
    web: ["web"],
    mobile: ["android", "ios"],
    desktop: ["windows", "mac", "linux"],
  } as const;

  const data: Record<string, Record<string, number>> = {};
  const platformsMap = new Map<string, number>();

  platforms.forEach((platform) => {
    const date = new Date(platform.month);
    const key = formatMonth(date);
    const platformKey = (
      Object.keys(PLATFORMS) as Array<keyof typeof PLATFORMS>
    ).find((key) => PLATFORMS[key].includes(platform.platform));

    if (!platformKey) return;

    if (!data[key]) data[key] = {};
    data[key][platformKey] = Number(platform.totalmsplayed);

    const currentMsPlayed = platformsMap.get(platformKey) ?? 0;
    platformsMap.set(
      platformKey,
      currentMsPlayed + Number(platform.totalmsplayed),
    );
  });

  const platformsLength = Array.from(platformsMap.values()).length;
  const totalMsPlayed = platforms.reduce(
    (acc, msPlayed) => acc + Number(msPlayed),
    0,
  );

  const average = totalMsPlayed / platformsLength;

  const mostUsedPlatform = Array.from(platformsMap.entries()).reduce(
    (acc, [key, value]) => {
      if (value > acc.value) {
        acc.key = key;
        acc.value = value;
      }
      return acc;
    },
    { key: "", value: 0 },
  );

  return {
    data: Object.entries(data).map(([month, platforms]) => ({
      month,
      mobile: platforms.mobile ?? 0,
      desktop: platforms.desktop ?? 0,
      web: platforms.web ?? 0,
    })),
    average: Math.round(average),
    mostUsedPlatform: {
      platform: mostUsedPlatform.key,
      value: mostUsedPlatform.value,
    },
  };
};

export const getFirstTimeListenedData = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const firstPlays = await prisma.track.findMany({
    where: { userId },
    orderBy: { timestamp: "asc" },
    distinct: ["spotifyId", "userId"],
    select: {
      timestamp: true,
      spotifyId: true,
      albumId: true,
      artistIds: true,
    },
  });

  if (firstPlays.length === 0) return null;

  const tracksData = aggregateData(firstPlays, (track) =>
    new Date(track.timestamp).toISOString().slice(0, 7),
  );

  const albumsData = aggregateData(
    Object.values(
      firstPlays.reduce<Record<string, { timestamp: Date; albumId: string }>>(
        (acc, play) => {
          if (!acc[play.albumId]) acc[play.albumId] = play;
          return acc;
        },
        {},
      ),
    ),
    (play) => new Date(play.timestamp).toISOString().slice(0, 7),
  );

  const artistsData = aggregateData(
    Object.values(
      firstPlays.reduce<
        Record<string, { timestamp: Date; artistIds: string[] }>
      >((acc, play) => {
        const key = play.artistIds.join(",");
        if (!acc[key]) acc[key] = play;
        return acc;
      }, {}),
    ),
    (play) => new Date(play.timestamp).toISOString().slice(0, 7),
  );

  const filterData = (
    data: Array<{ key: string; value: number }>,
    monthRange: { dateStart: Date; dateEnd: Date },
  ) =>
    data.filter((item) => {
      const date = new Date(item.key);
      return date >= monthRange.dateStart && date < monthRange.dateEnd;
    });

  return {
    tracks: {
      data: filterData(tracksData, monthRange).map((item) => ({
        month: item.key,
        value: item.value,
      })),
      totalUniqueFirstPlays: tracksData[tracksData.length - 1].value,
    },
    albums: {
      data: filterData(albumsData, monthRange).map((item) => ({
        month: item.key,
        value: item.value,
      })),
      totalUniqueFirstPlays: albumsData[albumsData.length - 1].value,
    },
    artists: {
      data: filterData(artistsData, monthRange).map((item) => ({
        month: item.key,
        value: item.value,
      })),
      totalUniqueFirstPlays: artistsData[artistsData.length - 1].value,
    },
  };
};
