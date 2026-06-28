import { db } from "@harmony/duckdb";

import type { ListeningHabitMetric, ListeningHabitTrendRow, ListeningHabitValueRow } from "../types";

import { mapTrendRows } from "./map-trend";

export const uniqueTracksFn = async (): Promise<ListeningHabitMetric> => {
  const [valueRows, trendRows] = await Promise.all([
    db.query<ListeningHabitValueRow>(`
      SELECT COUNT(DISTINCT track_id)::INTEGER AS value
      FROM interactions i
      WHERE i.ts IS NOT NULL
    `),
    db.query<ListeningHabitTrendRow>(`
      SELECT
        date_trunc('month', i.ts) AS month,
        COUNT(DISTINCT track_id)::INTEGER AS value
      FROM interactions i
      WHERE i.ts IS NOT NULL
      GROUP BY date_trunc('month', i.ts)
      ORDER BY month
    `),
  ]);

  return {
    value: valueRows[0]?.value ?? 0,
    trend: mapTrendRows(trendRows),
  };
};
