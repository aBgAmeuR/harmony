"server-only";

import { type Session } from "@repo/auth";
import { prisma } from "@repo/database";
import { cookies } from "next/headers";

export const getCookieRankingTimeRange = async () => {
  const cookieStore = await cookies();
  const cookieDateStart = cookieStore.get(
    "ranking-time-range|state|dates|start",
  );
  const cookieDateEnd = cookieStore.get("ranking-time-range|state|dates|end");

  if (!cookieDateStart || !cookieDateEnd) {
    return {
      dateStart: new Date("2016-01-01"),
      dateEnd: new Date(),
    };
  }

  return {
    dateStart: new Date(cookieDateStart.value),
    dateEnd: new Date(cookieDateEnd.value),
  };
};

export const addMonths = (input: Date, months: number) => {
  const date = new Date(input);
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  date.setDate(
    Math.min(
      input.getDate(),
      getDaysInMonth(date.getFullYear(), date.getMonth() + 1),
    ),
  );
  return date;
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

export const getCookieTopTimeRange = async () => {
  const cookieStore = await cookies();
  const cookieTimeRange = cookieStore.get("top-time-range|state|time_range");

  const timeRange = cookieTimeRange ? cookieTimeRange.value : "medium_term";
  return timeRange as "long_term" | "medium_term" | "short_term";
};

export const isDemo = (session: Session | null) =>
  session?.user?.name === "Demo";

export const getMonthRange = async (userId: string, isDemo: boolean) => {
  if (isDemo) {
    const date = new Date("2023-12-31T23:00:00.000Z");
    return {
      dateStart: date,
      dateEnd: new Date(),
    };
  }

  const monthsDates = await prisma.user.findFirst({
    where: { id: userId },
    select: { timeRangeDateEnd: true, timeRangeDateStart: true },
  });

  if (!monthsDates) return null;

  return {
    dateStart: monthsDates.timeRangeDateStart,
    dateEnd: monthsDates.timeRangeDateEnd,
  };
};
