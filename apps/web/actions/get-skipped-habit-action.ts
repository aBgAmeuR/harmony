"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

export const getSkippedHabitAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }

  const skippeds = await prisma.track.groupBy({
    by: ["skipped"],
    _count: {
      _all: true,
    },
    where: {
      userId: session.user.id,
      timestamp: {
        gte: minDate,
        lt: maxDate,
      },
    },
  });

  return [
    {
      skipped:
        skippeds.find((shuffle) => shuffle.skipped === true)?._count?._all || 0,
      notSkipped:
        skippeds.find((shuffle) => shuffle.skipped === false)?._count?._all ||
        0,
    },
  ];
};
