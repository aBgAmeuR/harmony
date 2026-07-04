import { db } from "@harmony/duckdb";

import type {
  ListeningHabitMetric,
  ListeningHabitTrendRow,
  ListeningHabitValueRow,
} from "../types";

import { mapTrendRows } from "./map-trend";

export const listeningTimeFn = async (): Promise<ListeningHabitMetric> => {
  const [valueRows, trendRows] = await Promise.all([
    db.query<ListeningHabitValueRow>(`
      SELECT ROUND(SUM(ms_played) / 3600000.0)::DOUBLE AS value
      FROM interactions i
      WHERE i.ts IS NOT NULL
    `),
    db.query<ListeningHabitTrendRow>(`
      SELECT
        date_trunc('month', i.ts) AS month,
        ROUND(SUM(ms_played) / 60000.0)::INTEGER AS value
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
