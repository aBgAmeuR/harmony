import { db } from "@harmony/duckdb";

import { aggregate } from "./aggregate";
import { listFn, type ListRow } from "./bases";
import { playsFrom, type Filter } from "./filter";
import { COMPLETION, FINISHED } from "./measures";
import { day, int } from "./sql";

type BehaviorRow = { complete: number; quick: number; skipPoint: number | null };

export const behaviorFn = async (filter: Filter) => {
  const [row] = await db.query<BehaviorRow>(`
    WITH plays AS (
      SELECT i.ms_played, i.skipped, t.duration
      ${playsFrom(filter, { needs: ["track"] })}
    )
    SELECT
      COALESCE(COUNT(*) FILTER (WHERE ms_played >= 60000 AND ${FINISHED}) / NULLIF(COUNT(*), 0), 0)::DOUBLE AS complete,
      COALESCE(COUNT(*) FILTER (WHERE ms_played < 60000) / NULLIF(COUNT(*), 0), 0)::DOUBLE AS quick,
      (AVG(${COMPLETION}) FILTER (WHERE skipped))::DOUBLE AS "skipPoint"
    FROM plays
  `);
  const complete = row?.complete ?? 0;
  const quick = row?.quick ?? 0;
  return { complete, quick, partial: 1 - complete - quick, skipPoint: row?.skipPoint ?? null };
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const habitsFn = async (filter: Filter) => {
  const [instants, days] = await Promise.all([
    aggregate({ by: "hour", measures: ["playtime"], filter }),
    aggregate<"playtime", string>({ by: "day", measures: ["playtime"], filter }),
  ]);
  const grid = WEEKDAYS.map(() => Array.from({ length: 24 }, () => 0));
  for (const { key, playtime } of instants) {
    const date = new Date(key * 1000);
    const row = grid[(date.getDay() + 6) % 7];
    if (row) row[date.getHours()] = (row[date.getHours()] ?? 0) + playtime;
  }
  const hours = Array.from({ length: 24 }, (_, hour) => ({
    label: String(hour).padStart(2, "0"),
    value: grid.reduce((sum, row) => sum + (row[hour] ?? 0), 0),
  }));
  const weekdays = WEEKDAYS.map((label, index) => ({
    label,
    value: (grid[index] ?? []).reduce((sum, value) => sum + value, 0),
  }));
  const [best] = days.toSorted((a, b) => b.playtime - a.playtime);
  return { hours, weekdays, grid, best };
};

const everyYear = (minutes: Map<number, number>) => {
  if (minutes.size === 0) return [];
  const first = Math.min(...minutes.keys());
  return Array.from({ length: Math.max(...minutes.keys()) - first + 1 }, (_, index) => ({
    label: String(first + index),
    value: minutes.get(first + index) ?? 0,
  }));
};

export const erasFn = async (filter: Filter) => {
  const rows = await aggregate({ by: "releaseYear", measures: ["playtime"], filter });
  return everyYear(new Map(rows.map((row) => [row.key, row.playtime])));
};

export const discoveredFn = async ({ from, ...filter }: Filter) => {
  const [row] = await db.query<{ tracks: number }>(`
    SELECT COUNT(*)::INTEGER AS tracks
    FROM (
      SELECT i.track_id
      ${playsFrom(filter)}
      GROUP BY i.track_id
      ${from ? `HAVING MIN(CAST(i.ts AS DATE)) >= ${day(from)}` : ""}
    )
  `);
  return row?.tracks ?? 0;
};

export const platformsFn = async (filter: Filter) => {
  const rows = await aggregate<"streams", string>({
    by: "platform",
    measures: ["streams"],
    filter,
  });
  const total = rows.reduce((sum, row) => sum + row.streams, 0);
  return rows
    .toSorted((a, b) => b.streams - a.streams || a.key.localeCompare(b.key))
    .map((row) => ({ platform: row.key, share: row.streams / total }));
};

const toPlay = (row: ListRow) => ({
  id: Number(row.id),
  track: Number(row.track),
  name: row.name,
  played: String(row.played),
  ms: Number(row.playtime) * 60_000,
  platform: String(row.platform ?? "other"),
  skipped: row.skipped === true,
  shuffle: row.shuffle === true,
  offline: row.offline === true,
});

export const playsFn = async (filter: Filter) => {
  const { rows } = await listFn({
    base: "plays",
    filter,
    sort: "played",
    desc: true,
    limit: 100_000,
  });
  return rows.map(toPlay);
};

export const firstPlayFn = async (rules: Filter["rules"]) => {
  const { rows } = await listFn({
    base: "plays",
    filter: { rules },
    sort: "played",
    desc: false,
    limit: 1,
  });
  return rows.map(toPlay).at(0) ?? null;
};

export const inOrderFn = async ({ albumId, range }: { albumId: number; range: Filter }) => {
  const [row] = await db.query<{ share: number }>(`
    WITH ordered AS (
      SELECT t.album_id, t.disk_number, t.track_position,
        LAG(t.album_id) OVER w AS prev_album,
        LAG(t.disk_number) OVER w AS prev_disk,
        LAG(t.track_position) OVER w AS prev_position
      ${playsFrom(range, { needs: ["track"] })}
      WINDOW w AS (ORDER BY i.ts)
    )
    SELECT COALESCE(
      COUNT(*) FILTER (
        WHERE prev_album = album_id
          AND prev_disk IS NOT DISTINCT FROM disk_number
          AND prev_position = track_position - 1
      ) / NULLIF(COUNT(*), 0), 0)::DOUBLE AS share
    FROM ordered
    WHERE album_id = ${int(albumId)}
  `);
  return row?.share ?? 0;
};
