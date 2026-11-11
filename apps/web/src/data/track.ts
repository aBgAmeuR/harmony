import { db } from "@harmony/duckdb";

import type { Range } from "@/shared/lib/date";

import { playsFrom } from "./filter";
import { COMPLETION, FINISHED } from "./measures";
import { int } from "./sql";

export type Retention = {
  key: "complete" | "partial" | "quick-skips";
  label: string;
  // Fraction of the plays, between 0 and 1.
  share: number;
};

type Behavior = {
  retention: Retention[];
  completeShare: number;
  avgSkipMs: number | null;
  trackDurationMs: number;
};

type BehaviorRow = {
  total: number;
  complete: number;
  partial: number;
  quick: number;
  avg_skip_ms: number | null;
  duration_ms: number | null;
};

// How plays of a track end: heard through, cut short, or skipped within the first minute.
export const behaviorFn = async ({
  trackId,
  range,
}: {
  trackId: number;
  range: Range;
}): Promise<Behavior> => {
  const [row] = await db.query<BehaviorRow>(`
    WITH classified AS (
      SELECT ms_played, skipped, duration,
        CASE
          WHEN ms_played < 60000 THEN 'quick'
          WHEN ${FINISHED} THEN 'complete'
          ELSE 'partial'
        END AS bucket
      FROM (SELECT i.ms_played, i.skipped, t.duration ${playsFrom({ ...range, rules: [{ field: "track", op: "is", value: trackId }] }, { needs: ["track"] })})
    )
    SELECT
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE bucket = 'complete')::INTEGER AS complete,
      COUNT(*) FILTER (WHERE bucket = 'partial')::INTEGER AS partial,
      COUNT(*) FILTER (WHERE bucket = 'quick')::INTEGER AS quick,
      ROUND(AVG(ms_played) FILTER (WHERE skipped))::DOUBLE AS avg_skip_ms,
      (ANY_VALUE(duration) * 1000)::INTEGER AS duration_ms
    FROM classified
  `);
  const total = row?.total ?? 0;
  const share = (count: number | undefined) => (total > 0 ? (count ?? 0) / total : 0);
  const retention: Retention[] = [
    { key: "complete", label: "Complete", share: share(row?.complete) },
    { key: "partial", label: "Partial", share: share(row?.partial) },
    { key: "quick-skips", label: "Quick Skips", share: share(row?.quick) },
  ];
  return {
    retention,
    completeShare: share(row?.complete),
    avgSkipMs: row?.avg_skip_ms ?? null,
    trackDurationMs: row?.duration_ms ?? 0,
  };
};

type VsAverage = { label: string; multiplier: number }[];

type VsRow = { streams: number | null; completion: number | null; replay: number | null };

const rounded = (value: number | null | undefined): number =>
  value === null || value === undefined || !Number.isFinite(value)
    ? 0
    : Math.round(value * 10) / 10;

// The track against the average track of the period: streams, completion and plays per day.
export const vsAverageFn = async ({
  trackId,
  range,
}: {
  trackId: number;
  range: Range;
}): Promise<VsAverage> => {
  const [row] = await db.query<VsRow>(`
    WITH stats AS (
      SELECT track_id,
        COUNT(*)::DOUBLE AS streams,
        AVG(${COMPLETION}) AS completion,
        COUNT(*)::DOUBLE / NULLIF(COUNT(DISTINCT CAST(ts AS DATE)), 0) AS replay
      FROM (
        SELECT i.track_id, i.ts, i.ms_played, t.duration
        ${playsFrom(range, { needs: ["track"] })}
      )
      GROUP BY track_id
    ),
    averages AS (
      SELECT AVG(streams) AS streams, AVG(completion) AS completion, AVG(replay) AS replay
      FROM stats
    )
    SELECT
      (s.streams / NULLIF(a.streams, 0))::DOUBLE AS streams,
      (s.completion / NULLIF(a.completion, 0))::DOUBLE AS completion,
      (s.replay / NULLIF(a.replay, 0))::DOUBLE AS replay
    FROM stats s CROSS JOIN averages a
    WHERE s.track_id = ${int(trackId)}
  `);
  return [
    { label: "Streams", multiplier: rounded(row?.streams) },
    { label: "Completion", multiplier: rounded(row?.completion) },
    { label: "Replay rate", multiplier: rounded(row?.replay) },
  ];
};
