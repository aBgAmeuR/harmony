import { db } from "@harmony/duckdb";

import type {
  ListeningHabitMetric,
  ListeningHabitTrendRow,
  ListeningHabitValueRow,
} from "../types";

import { buildListeningFilter, type ListeningRangeParams } from "./listening-filter";
import { mapTrendRows } from "./map-trend";

export const uniqueTracksFn = async (
  params: ListeningRangeParams,
): Promise<ListeningHabitMetric> => {
  const { artistJoin, where, periodRange, periodExpr } = buildListeningFilter(params);

  const [valueRows, trendRows] = await Promise.all([
    db.query<ListeningHabitValueRow>(`
      SELECT COUNT(DISTINCT i.track_id)::INTEGER AS value
      FROM interactions i
      ${artistJoin}
      ${where}
    `),
    db.query<ListeningHabitTrendRow>(`
      WITH period_range AS (
        ${periodRange}
      ),
      stats AS (
        SELECT
          ${periodExpr} AS period,
          COUNT(DISTINCT i.track_id)::INTEGER AS value
        FROM interactions i
        ${artistJoin}
        ${where}
        GROUP BY ${periodExpr}
      )
      SELECT
        p.period AS month,
        COALESCE(s.value, 0)::INTEGER AS value
      FROM period_range p
      LEFT JOIN stats s ON s.period = p.period
      ORDER BY p.period
    `),
  ]);

  return {
    value: valueRows[0]?.value ?? 0,
    trend: mapTrendRows(trendRows),
  };
};
