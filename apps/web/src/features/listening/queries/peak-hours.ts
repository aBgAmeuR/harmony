import { db } from "@harmony/duckdb";

import type { PeakHourPoint } from "../types";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export const peakHoursFn = async (): Promise<PeakHourPoint[]> => {
  const rows = await db.query<{ hour: number; value: number }>(`
    SELECT
      EXTRACT(HOUR FROM i.ts)::INTEGER AS hour,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    WHERE i.ts IS NOT NULL
    GROUP BY hour
    ORDER BY hour
  `);

  const countByHour = new Map(rows.map((row) => [row.hour, row.value]));

  return HOURS.map((hour) => ({
    name: String(hour),
    value: countByHour.get(hour) ?? 0,
  }));
};
