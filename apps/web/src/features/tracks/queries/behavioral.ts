import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

export type BehavioralRetentionSegment = {
  key: "complete" | "partial" | "quick-skips";
  label: string;
  percentage: number;
  colorClass: string;
};

export type TrackBehavioralMetrics = {
  retention: BehavioralRetentionSegment[];
  completePercentage: number;
  avgSkipMs: number | null;
  trackDurationMs: number;
};

type BehavioralRow = {
  total: number;
  quick_skips: number;
  complete: number;
  partial: number;
  avg_skip_ms: number | null;
  track_duration_ms: number | null;
};

type TrackBehavioralParams = {
  trackId: number;
  from: Date;
  to: Date;
};

const RETENTION_META = [
  { key: "complete", label: "Complete", colorClass: "bg-primary" },
  { key: "partial", label: "Partial", colorClass: "bg-amber-400" },
  { key: "quick-skips", label: "Quick Skips", colorClass: "bg-destructive" },
] as const;

export const trackBehavioralFn = async ({
  trackId,
  from,
  to,
}: TrackBehavioralParams): Promise<TrackBehavioralMetrics> => {
  const conditions = [...interactionDateConditions(from, to), `i.track_id = ${trackId}`];

  const [row] = await db.query<BehavioralRow>(`
    WITH classified AS (
      SELECT
        i.ms_played,
        i.skipped,
        CASE
          WHEN i.ms_played < 60000 THEN 'quick-skips'
          WHEN NOT i.skipped
            AND i.ms_played >= GREATEST(t.duration * 800, 30000)
            THEN 'complete'
          ELSE 'partial'
        END AS bucket,
        t.duration
      FROM interactions i
      INNER JOIN tracks t ON t.id = i.track_id
      ${joinWhere(conditions)}
    )
    SELECT
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (WHERE bucket = 'quick-skips')::INTEGER AS quick_skips,
      COUNT(*) FILTER (WHERE bucket = 'complete')::INTEGER AS complete,
      COUNT(*) FILTER (WHERE bucket = 'partial')::INTEGER AS partial,
      ROUND(AVG(ms_played) FILTER (WHERE skipped))::DOUBLE AS avg_skip_ms,
      (ANY_VALUE(duration) * 1000)::INTEGER AS track_duration_ms
    FROM classified
  `);

  const total = row?.total ?? 0;
  const counts = {
    complete: row?.complete ?? 0,
    partial: row?.partial ?? 0,
    "quick-skips": row?.quick_skips ?? 0,
  } as const;

  const retention = RETENTION_META.map((segment) => {
    const count = counts[segment.key];
    return {
      ...segment,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return {
    retention,
    completePercentage: retention.find((segment) => segment.key === "complete")?.percentage ?? 0,
    avgSkipMs: row?.avg_skip_ms ?? null,
    trackDurationMs: row?.track_duration_ms ?? 0,
  };
};
