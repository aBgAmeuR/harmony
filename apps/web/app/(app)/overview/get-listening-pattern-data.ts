"server-only";

import { prisma } from "@repo/database";

import { getMonthRangeAction } from "~/actions/month-range-actions";

export const getListeningPatternData = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const listeningTime: { period: string; time: bigint }[] =
    await prisma.$queryRaw`
    SELECT
      CASE
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 12 THEN 'Morning'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 12 AND 14 THEN 'Noon'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 14 AND 18 THEN 'Afternoon'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 18 AND 20 THEN 'Early Evening'
        WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 20 AND 24 THEN 'Late Evening'
        ELSE 'Night'
      END AS period,
      SUM("msPlayed") AS time
    FROM "Track"
    WHERE "userId" = ${userId}
      AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
    GROUP BY period 
  `;

  const sortedListeningTime = listeningTime
    ?.map((data: any) => ({
      subject: data.period,
      time: Number(data.time),
    }))
    .sort((a, b) => {
      const order = [
        "Morning",
        "Noon",
        "Afternoon",
        "Early Evening",
        "Late Evening",
        "Night",
      ];
      return order.indexOf(a.subject) - order.indexOf(b.subject);
    });

  return sortedListeningTime;
};
