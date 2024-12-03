"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

const TOP_PLATFORMS_LIMIT = 5;

export const getTopPlatformsAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }
  const tracks = await prisma.track.findMany({
    where: {
      userId: session.user.id,
      timestamp: {
        gte: minDate,
        lt: maxDate,
      },
    },
    select: {
      platform: true,
      msPlayed: true,
    },
  });
  const platforms = new Map<string, number>();

  tracks.forEach((track) => {
    if (platforms.has(track.platform)) {
      const currentMsPlayed = platforms.get(track.platform) ?? 0;
      platforms.set(track.platform, currentMsPlayed + Number(track.msPlayed));
    } else {
      platforms.set(track.platform, Number(track.msPlayed));
    }
  });

  const topPlatforms = Array.from(platforms.entries()).sort(
    ([, a], [, b]) => b - a,
  );

  if (topPlatforms.length > TOP_PLATFORMS_LIMIT) {
    const otherMsPlayed = topPlatforms
      .slice(TOP_PLATFORMS_LIMIT)
      .reduce((acc, [, msPlayed]) => {
        return acc + msPlayed;
      }, 0);
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
