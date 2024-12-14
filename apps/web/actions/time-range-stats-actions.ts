"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

import { isDemo } from "~/lib/utils-server";

export const getTimeRangeStatsAction = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) return null;
  if (isDemo(session)) return "medium_term";

  const timeRangeStats = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: { timeRangeStats: true },
  });

  return timeRangeStats?.timeRangeStats || null;
};

export const setTimeRangeStatsAction = async (
  timeRangeStats: "short_term" | "medium_term" | "long_term",
) => {
  const session = await auth();

  if (!session || !session.user || !session.user.id || isDemo(session))
    return null;

  if (!["short_term", "medium_term", "long_term"].includes(timeRangeStats))
    return null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { timeRangeStats },
  });

  revalidatePath("/top");
};
