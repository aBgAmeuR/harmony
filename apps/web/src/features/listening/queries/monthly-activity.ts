import { db } from "@harmony/duckdb";

import type { MonthlyActivityPoint } from "../types";

import { buildListeningFilter, type ListeningRangeParams } from "./listening-filter";

export const monthlyActivityFn = async (
  params: ListeningRangeParams,
): Promise<MonthlyActivityPoint[]> => {
  const { artistJoin, where, byDay, periodRange, periodExpr } = buildListeningFilter(params);
  const nameFormat = byDay ? "%d %b %Y" : "%b %Y";

  return await db.query<MonthlyActivityPoint>(`
    WITH period_range AS (
      ${periodRange}
    ),
    stats AS (
      SELECT
        ${periodExpr} AS period,
        (SUM(i.ms_played) / 60000)::INTEGER AS value
      FROM interactions i
      ${artistJoin}
      ${where}
      GROUP BY ${periodExpr}
    )
    SELECT
      strftime(p.period, '${nameFormat}') AS name,
      COALESCE(s.value, 0)::INTEGER AS value
    FROM period_range p
    LEFT JOIN stats s ON s.period = p.period
    ORDER BY p.period
  `);
};
