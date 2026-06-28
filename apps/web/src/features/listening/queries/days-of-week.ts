import { db } from "@harmony/duckdb";

import type { DaysOfWeekChartData, DayOfWeekRow } from "../types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const daysOfWeekFn = async (): Promise<DaysOfWeekChartData> => {
  const rows = await db.query<DayOfWeekRow>(`
    SELECT
      ((dayofweek(i.ts) + 6) % 7)::INTEGER AS day_index,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    WHERE i.ts IS NOT NULL
    GROUP BY day_index
    ORDER BY day_index
  `);

  const metrics = DAY_LABELS.map((day) => ({ key: day, label: day }));
  const countByDay = new Map(rows.map((row) => [DAY_LABELS[row.day_index], row.value]));
  const max = Math.max(0, ...DAY_LABELS.map((day) => countByDay.get(day) ?? 0));

  const values = Object.fromEntries(
    metrics.map((metric) => [
      metric.key,
      max > 0 ? ((countByDay.get(metric.key) ?? 0) / max) * 100 : 0,
    ]),
  );

  return {
    metrics,
    data: [{ label: "Listening", values }],
  };
};
