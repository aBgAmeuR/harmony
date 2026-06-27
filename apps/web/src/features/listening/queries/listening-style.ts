import { db } from "@harmony/duckdb";

import type { ListeningStyleMetric } from "../types";

type ListeningStyleRow = {
  shuffle: number;
  skipped: number;
  offline: number;
  finished: number;
};

const LISTENING_STYLE_LABELS = {
  shuffle: "Shuffle",
  skipped: "Skipped",
  offline: "Offline",
  finished: "Finished",
} as const;

export const listeningStyleFn = async (): Promise<ListeningStyleMetric[]> => {
  const [row] = await db.query<ListeningStyleRow>(`
    SELECT
      ROUND(100.0 * COUNT(*) FILTER (WHERE i.shuffle) / NULLIF(COUNT(*), 0))::INTEGER AS shuffle,
      ROUND(100.0 * COUNT(*) FILTER (WHERE i.skipped) / NULLIF(COUNT(*), 0))::INTEGER AS skipped,
      ROUND(100.0 * COUNT(*) FILTER (WHERE i.offline) / NULLIF(COUNT(*), 0))::INTEGER AS offline,
      ROUND(
        100.0 * COUNT(*) FILTER (
          WHERE NOT i.skipped
            AND i.ms_played >= GREATEST(t.duration * 800, 30000)
        ) / NULLIF(COUNT(*), 0)
      )::INTEGER AS finished
    FROM interactions i
    INNER JOIN tracks t ON t.id = i.track_id
    WHERE i.ts IS NOT NULL
  `);

  return (Object.keys(LISTENING_STYLE_LABELS) as (keyof typeof LISTENING_STYLE_LABELS)[]).map(
    (key) => ({
      label: LISTENING_STYLE_LABELS[key],
      value: row?.[key] ?? 0,
    }),
  );
};
