"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

import { isDemo } from "~/lib/utils-server";

export const getMonthRangeAction = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) return null;

  if (isDemo(session)) {
    const date = new Date("2023-12-31T23:00:00.000Z");
    return {
      dateStart: date,
      dateEnd: new Date(),
    };
  }

  const monthsDates = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: { timeRangeDateEnd: true, timeRangeDateStart: true },
  });

  if (!monthsDates) return null;

  return {
    dateStart: monthsDates.timeRangeDateStart,
    dateEnd: monthsDates.timeRangeDateEnd,
  };
};

export const setMonthStatsAction = async (dateStart: Date, dateEnd: Date) => {
  const session = await auth();

  if (!session || !session.user || !session.user.id || isDemo(session))
    return null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { timeRangeDateStart: dateStart, timeRangeDateEnd: dateEnd },
  });

  revalidatePath("/");
};

export const setDefaulMonthStatsAction = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id || isDemo(session))
    return null;

  const minDate = await prisma.track.findFirst({
    where: { userId: session.user.id },
    select: { timestamp: true },
    orderBy: { timestamp: "asc" },
  });

  const maxDate = await prisma.track.findFirst({
    where: { userId: session.user.id },
    select: { timestamp: true },
    orderBy: { timestamp: "desc" },
  });

  if (!minDate || !maxDate) return null;

  return await setMonthStatsAction(minDate.timestamp, maxDate.timestamp);
};
