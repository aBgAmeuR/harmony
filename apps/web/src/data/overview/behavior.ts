import { db } from "@harmony/duckdb";

import { PLATFORM_LABELS } from "@/data/listening/platforms";
import { interactionDateConditions, joinWhere } from "@/data/sql/date-range";

import type { Range } from "./range";

export type Behavior = {
  streams: number;
  finished: number;
  skipped: number;
  shuffle: number;
  offline: number;
  platforms: { label: string; value: number }[];
};

type BehaviorRow = {
  streams: number;
  finished: number;
  skipped: number;
  shuffle: number;
  offline: number;
};

// A stream is "finished" once at least 80% of the track was heard (30s minimum), as in Listening Habits.
const FINISHED_SQL = `NOT COALESCE(i.skipped, FALSE) AND i.ms_played >= GREATEST(t.duration * 800, 30000)`;

export const behaviorFn = async ({ from, to }: Range): Promise<Behavior> => {
  const where = joinWhere(interactionDateConditions(from, to));

  const [rows, platforms] = await Promise.all([
    db.query<BehaviorRow>(`
      SELECT
        COUNT(*)::INTEGER AS streams,
        COUNT(*) FILTER (WHERE ${FINISHED_SQL})::INTEGER AS finished,
        COUNT(*) FILTER (WHERE i.skipped)::INTEGER AS skipped,
        COUNT(*) FILTER (WHERE i.shuffle)::INTEGER AS shuffle,
        COUNT(*) FILTER (WHERE i.offline)::INTEGER AS offline
      FROM interactions i
      JOIN tracks t ON t.id = i.track_id
      ${where}
    `),
    db.query<{ platform: string; value: number }>(`
      SELECT i.platform, COUNT(*)::INTEGER AS value
      FROM interactions i
      ${joinWhere([...interactionDateConditions(from, to), "i.platform IS NOT NULL"])}
      GROUP BY i.platform
      ORDER BY value DESC
    `),
  ]);

  const row = rows[0];
  return {
    streams: row?.streams ?? 0,
    finished: row?.finished ?? 0,
    skipped: row?.skipped ?? 0,
    shuffle: row?.shuffle ?? 0,
    offline: row?.offline ?? 0,
    platforms: platforms.map((p) => ({
      label: PLATFORM_LABELS[p.platform] ?? p.platform,
      value: p.value,
    })),
  };
};
