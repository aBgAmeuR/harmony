"server-only";

import { prisma } from "@repo/database";
import { format, localeFormat } from "light-date";

import { getMonthRangeAction } from "~/actions/month-range-actions";

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

  if (tracks.length === 0) return null;

  const data: Record<string, number> = {};
  let totalMsPlayed = 0;

  tracks.forEach((track) => {
    const date = new Date(track.month);
    const key = `${localeFormat(date, "{MMM}")} ${format(date, "{yyyy}")}`;
    data[key] = Number(track.totalmsplayed);
    totalMsPlayed += Number(track.totalmsplayed);
  });

  const average = totalMsPlayed / tracks.length;

  return {
    data: Object.entries(data).map(([key, value]) => ({
      month: key,
      value,
    })),
    average,
  };
};
