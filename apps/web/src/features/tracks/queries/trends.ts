import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";
import { buildPeriodRange } from "@/lib/sql/period-range";

export type TrackTrendPoint = {
  date: Date;
  value: number;
};

export type TrackTrends = Record<number, TrackTrendPoint[]>;

type TrackTrendRow = {
  track_id: number;
  period: string | Date;
  value: number;
};

type TrackTrendsParams = {
  trackIds: number[];
  from: Date;
  to: Date;
};

export const trackTrendsFn = async ({
  trackIds,
  from,
  to,
}: TrackTrendsParams): Promise<TrackTrends> => {
  if (trackIds.length === 0) {
    return {};
  }

  const { periodRange, periodExpr } = buildPeriodRange(from, to);
  const idsList = trackIds.join(", ");
  const conditions = [...interactionDateConditions(from, to), `i.track_id IN (${idsList})`];

  const rows = await db.query<TrackTrendRow>(`
    WITH period_range AS (
      ${periodRange}
    ),
    track_ids AS (
      SELECT UNNEST([${idsList}])::BIGINT AS track_id
    ),
    stats AS (
      SELECT
        i.track_id,
        ${periodExpr} AS period,
        ROUND(SUM(i.ms_played) / 60000.0)::INTEGER AS value
      FROM interactions i
      ${joinWhere(conditions)}
      GROUP BY i.track_id, ${periodExpr}
    )
    SELECT
      t.track_id,
      p.period,
      COALESCE(s.value, 0)::INTEGER AS value
    FROM track_ids t
    CROSS JOIN period_range p
    LEFT JOIN stats s ON s.track_id = t.track_id AND s.period = p.period
    ORDER BY t.track_id, p.period
  `);

  const trends: TrackTrends = {};
  for (const id of trackIds) {
    trends[id] = [];
  }

  for (const row of rows) {
    const points = trends[row.track_id];
    if (!points) continue;
    points.push({
      date: row.period instanceof Date ? row.period : new Date(row.period),
      value: row.value,
    });
  }

  return trends;
};
