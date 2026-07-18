import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

export type VsAverageRow = {
  label: string;
  multiplier: number;
};

export type TrackVsAverageMetrics = {
  rows: VsAverageRow[];
};

type VsAverageSqlRow = {
  streams_multiplier: number | null;
  completion_multiplier: number | null;
  replay_multiplier: number | null;
};

type TrackVsAverageParams = {
  trackId: number;
  from: Date;
  to: Date;
};

function toMultiplier(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

export const trackVsAverageFn = async ({
  trackId,
  from,
  to,
}: TrackVsAverageParams): Promise<TrackVsAverageMetrics> => {
  const conditions = interactionDateConditions(from, to);

  const [row] = await db.query<VsAverageSqlRow>(`
    WITH track_stats AS (
      SELECT
        i.track_id,
        COUNT(*)::DOUBLE AS streams,
        AVG(
          LEAST(
            i.ms_played::DOUBLE / NULLIF(t.duration * 1000.0, 0),
            1.0
          )
        ) AS completion,
        COUNT(*)::DOUBLE / NULLIF(COUNT(DISTINCT CAST(i.ts AS DATE)), 0) AS replay_rate
      FROM interactions i
      INNER JOIN tracks t ON t.id = i.track_id
      ${joinWhere(conditions)}
      GROUP BY i.track_id
    ),
    averages AS (
      SELECT
        AVG(streams) AS avg_streams,
        AVG(completion) AS avg_completion,
        AVG(replay_rate) AS avg_replay_rate
      FROM track_stats
    )
    SELECT
      (ts.streams / NULLIF(a.avg_streams, 0))::DOUBLE AS streams_multiplier,
      (ts.completion / NULLIF(a.avg_completion, 0))::DOUBLE AS completion_multiplier,
      (ts.replay_rate / NULLIF(a.avg_replay_rate, 0))::DOUBLE AS replay_multiplier
    FROM track_stats ts
    CROSS JOIN averages a
    WHERE ts.track_id = ${trackId}
  `);

  return {
    rows: [
      { label: "Streams", multiplier: toMultiplier(row?.streams_multiplier) },
      { label: "Completion", multiplier: toMultiplier(row?.completion_multiplier) },
      { label: "Replay rate", multiplier: toMultiplier(row?.replay_multiplier) },
    ],
  };
};
