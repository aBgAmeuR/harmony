import { db } from "@harmony/duckdb";

import { joinWhere } from "@/data/sql/date-range";

import type { ListeningStyleMetric } from "./types";

import { buildListeningFilter, type ListeningRangeParams } from "./listening-filter";

type ListeningStyleRow = {
  streams: number;
  finished: number;
  skipped: number;
  shuffle: number;
  offline: number;
};

const LISTENING_STYLE_LABELS = {
  finished: "Finished",
  skipped: "Skipped",
  shuffle: "Shuffle",
  offline: "Offline",
} as const;

// Share of the plays, between 0 and 1, that were finished, skipped, shuffled and offline.
export const listeningStyleFn = async (
  params: ListeningRangeParams,
): Promise<ListeningStyleMetric[]> => {
  const { conditions } = buildListeningFilter(params);

  // A play is "finished" once 80% of the track was heard (30s minimum).
  const [row] = await db.query<ListeningStyleRow>(`
    SELECT
      COUNT(*)::INTEGER AS streams,
      COUNT(*) FILTER (
        WHERE NOT COALESCE(i.skipped, FALSE)
          AND i.ms_played >= GREATEST(t.duration * 800, 30000)
      )::INTEGER AS finished,
      COUNT(*) FILTER (WHERE i.skipped)::INTEGER AS skipped,
      COUNT(*) FILTER (WHERE i.shuffle)::INTEGER AS shuffle,
      COUNT(*) FILTER (WHERE i.offline)::INTEGER AS offline
    FROM interactions i
    INNER JOIN tracks t ON t.id = i.track_id
    ${joinWhere(conditions)}
  `);

  const streams = row?.streams ?? 0;
  return (Object.keys(LISTENING_STYLE_LABELS) as (keyof typeof LISTENING_STYLE_LABELS)[]).map(
    (key) => ({
      key,
      label: LISTENING_STYLE_LABELS[key],
      value: streams > 0 ? (row?.[key] ?? 0) / streams : 0,
    }),
  );
};
