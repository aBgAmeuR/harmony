"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

export const getMinMaxDateRangeAction = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) return null;

  const userId = session.user.id;

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
