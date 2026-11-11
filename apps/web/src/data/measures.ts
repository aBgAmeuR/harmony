import type { Kind } from "@/shared/lib/format";

import type { Join } from "./filter";

type Measure = {
  label: string;
  kind: Kind | "date";
  // An aggregate over the columns of `base` (see aggregate.ts). `null` for `artists`, which needs
  // the track's artist list unnested on its own.
  sql: string | null;
  needs?: Join;
};

// A play heard through: not skipped, and at least 80% of the track (30 s minimum).
export const FINISHED =
  "NOT COALESCE(skipped, FALSE) AND ms_played >= GREATEST(duration * 800, 30000)";

// The share of the track a play heard, capped at the whole track.
export const COMPLETION = "LEAST(ms_played::DOUBLE / NULLIF(duration * 1000.0, 0), 1.0)";

const rate = (condition: string) =>
  `COALESCE(COUNT(*) FILTER (WHERE ${condition}) / NULLIF(COUNT(*), 0), 0)::DOUBLE`;

// The only definitions of what the app counts. A play is one row of `interactions`.
const measureList = {
  streams: { label: "Streams", kind: "count", sql: "COUNT(*)::INTEGER" },
  playtime: {
    label: "Time listened",
    kind: "minutes",
    sql: "(COALESCE(SUM(ms_played), 0) / 60000.0)::DOUBLE",
  },
  tracks: { label: "Tracks played", kind: "count", sql: "COUNT(DISTINCT track_id)::INTEGER" },
  albums: {
    label: "Albums played",
    kind: "count",
    sql: "COUNT(DISTINCT album_id)::INTEGER",
    needs: "track",
  },
  artists: { label: "Artists", kind: "count", sql: null, needs: "track" },
  days: { label: "Active days", kind: "count", sql: "COUNT(DISTINCT CAST(ts AS DATE))::INTEGER" },
  skipRate: { label: "Skip rate", kind: "percent", sql: rate("skipped") },
  shuffleRate: { label: "Shuffle", kind: "percent", sql: rate("shuffle") },
  offlineRate: { label: "Offline", kind: "percent", sql: rate("offline") },
  finishedRate: {
    label: "Finished",
    kind: "percent",
    sql: rate(FINISHED),
    needs: "track",
  },
  completion: {
    label: "Avg completion",
    kind: "percent",
    sql: `COALESCE(AVG(${COMPLETION}), 0)::DOUBLE`,
    needs: "track",
  },
  firstPlayed: {
    label: "First played",
    kind: "date",
    sql: "strftime(MIN(ts), '%Y-%m-%d %H:%M:%S')",
  },
  lastPlayed: { label: "Last played", kind: "date", sql: "strftime(MAX(ts), '%Y-%m-%d %H:%M:%S')" },
} satisfies Record<string, Measure>;

export type MeasureId = keyof typeof measureList;

// Precise per measure, so `measures.playtime.kind` is "minutes".
export const measures = measureList;

export const measure = (id: MeasureId): Measure => measures[id];

type DateMeasure = "firstPlayed" | "lastPlayed";

// The value of each measure in a result row.
export type Values<M extends MeasureId> = {
  [K in M]: K extends DateMeasure ? string | null : number;
};
