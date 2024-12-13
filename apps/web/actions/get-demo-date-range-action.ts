"use server";

import { prisma } from "@repo/database";

export const getDemoDateRangeAction = async () => {
  const userId = process.env.DEMO_ID;

  const minDate = await prisma.track.findFirst({
    where: {
      userId,
    },
    select: {
      timestamp: true,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  const maxDate = await prisma.track.findFirst({
    where: {
      userId,
    },
    select: {
      timestamp: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  if (!minDate || !maxDate) return null;

  return { minDate: minDate.timestamp, maxDate: maxDate.timestamp };
};
