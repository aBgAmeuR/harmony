import { db } from "@harmony/duckdb";

import type { OverTime, OverTimeUnit } from "./types";

import {
  buildListeningFilter,
  calendarDaySpan,
  type ListeningRangeParams,
} from "./listening-filter";

// Days under a month, weeks under half a year, months above.
export const overTimeUnitFor = (from: Date, to: Date): OverTimeUnit => {
  const days = calendarDaySpan(from, to);
  if (days < 31) return "day";
  return days < 183 ? "week" : "month";
};

type OverTimeRow = { start: string; value: number; last: string | null };

// Minutes listened per day, week (from Monday) or month of the period, empty buckets included.
// `last` is the day of the newest play in the package, whatever the filters: buckets after it
// have no data yet.
export const overTimeFn = async (
  params: ListeningRangeParams & { unit: OverTimeUnit },
): Promise<OverTime> => {
  const { artistJoin, where, fromSql, toSql } = buildListeningFilter(params);
  const unit = params.unit;

  const rows = await db.query<OverTimeRow>(`
    WITH buckets AS (
      SELECT generate_series::DATE AS start
      FROM generate_series(
        date_trunc('${unit}', DATE '${fromSql}')::DATE,
        date_trunc('${unit}', DATE '${toSql}')::DATE,
        INTERVAL 1 ${unit.toUpperCase()}
      )
    ),
    stats AS (
      SELECT
        date_trunc('${unit}', i.ts)::DATE AS start,
        SUM(i.ms_played) / 60000.0 AS value
      FROM interactions i
      ${artistJoin}
      ${where}
      GROUP BY 1
    )
    SELECT
      strftime(b.start, '%Y-%m-%d') AS start,
      COALESCE(s.value, 0)::DOUBLE AS value,
      (SELECT strftime(max(ts)::DATE, '%Y-%m-%d') FROM interactions) AS last
    FROM buckets b
    LEFT JOIN stats s ON s.start = b.start
    ORDER BY b.start
  `);

  return {
    unit,
    points: rows.map((row) => ({ start: row.start, value: row.value })),
    last: rows[0]?.last ?? null,
  };
};
