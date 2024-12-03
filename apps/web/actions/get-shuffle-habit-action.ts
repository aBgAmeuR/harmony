"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

export const getShuffleHabitAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }

  const shuffles = await prisma.track.groupBy({
    by: ["shuffle"],
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
      shuffle: "Shuffled",
      fill: "hsl(var(--chart-1))",
      totalPlayed:
        shuffles.find((shuffle) => shuffle.shuffle === true)?._count?._all || 0,
    },
    {
      shuffle: "Not Shuffled",
      fill: "hsl(var(--chart-6))",
      totalPlayed:
        shuffles.find((shuffle) => shuffle.shuffle === false)?._count?._all ||
        1,
    },
  ];
};
