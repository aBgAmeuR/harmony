import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

export type TrackOverviewMetrics = {
  streams: number;
  timeListenedMin: number;
  avgCompletion: number;
  skipRate: number;
};

type TrackOverviewRow = {
  streams: number;
  time_listened_min: number | null;
  avg_completion: number | null;
  skip_rate: number | null;
};

type TrackOverviewParams = {
  trackId: number;
  from: Date;
  to: Date;
};

export const trackOverviewFn = async ({
  trackId,
  from,
  to,
}: TrackOverviewParams): Promise<TrackOverviewMetrics> => {
  const conditions = [...interactionDateConditions(from, to), `i.track_id = ${trackId}`];

  const [row] = await db.query<TrackOverviewRow>(`
    SELECT
      COUNT(*)::INTEGER AS streams,
      ROUND(SUM(i.ms_played) / 60000.0, 1)::DOUBLE AS time_listened_min,
      ROUND(
        100.0 * AVG(
          LEAST(
            i.ms_played::DOUBLE / NULLIF(t.duration * 1000.0, 0),
            1.0
          )
        ),
        1
      )::DOUBLE AS avg_completion,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE i.skipped) / NULLIF(COUNT(*), 0),
        1
      )::DOUBLE AS skip_rate
    FROM interactions i
    INNER JOIN tracks t ON t.id = i.track_id
    ${joinWhere(conditions)}
  `);

  return {
    streams: row?.streams ?? 0,
    timeListenedMin: row?.time_listened_min ?? 0,
    avgCompletion: row?.avg_completion ?? 0,
    skipRate: row?.skip_rate ?? 0,
  };
};
