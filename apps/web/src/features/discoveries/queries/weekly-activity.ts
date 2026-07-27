import { db } from "@harmony/duckdb";

import type { Filter } from "@/lib/filter";

import { toSqlDate } from "@/lib/sql/date-range";

import type { WeeklyActivityPoint } from "../types";

export async function weeklyActivityFn(filter: Filter): Promise<WeeklyActivityPoint[]> {
  const artistId = filter.artistId;
  if (artistId == null) return [];

  const from = toSqlDate(filter.from);
  const to = toSqlDate(filter.to);

  return db.query<WeeklyActivityPoint>(`
    WITH period_range AS (
      SELECT date_trunc('week', generate_series::DATE)::DATE AS period
      FROM generate_series(
        date_trunc('week', DATE '${from}')::DATE,
        date_trunc('week', DATE '${to}')::DATE,
        INTERVAL 1 WEEK
      )
    ),
    stats AS (
      SELECT
        date_trunc('week', i.ts)::DATE AS period,
        (SUM(i.ms_played) / 60000)::INTEGER AS value
      FROM interactions i
      JOIN tracks t ON t.id = i.track_id
      WHERE CAST(i.ts AS DATE) >= DATE '${from}'
        AND CAST(i.ts AS DATE) <= DATE '${to}'
        AND t.artists @> ARRAY[${artistId}]
      GROUP BY date_trunc('week', i.ts)::DATE
    )
    SELECT
      strftime(p.period, '%d %b %Y') AS name,
      COALESCE(s.value, 0)::INTEGER AS value
    FROM period_range p
    LEFT JOIN stats s ON s.period = p.period
    ORDER BY p.period
  `);
}
