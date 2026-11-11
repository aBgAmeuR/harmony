import type { Scope } from "@/shared/scope";

import { aggregate, series, totals, unitFor, type Unit } from "@/data/aggregate";
import { listFn } from "@/data/bases";
import { scopeFilter } from "@/data/filter";
import { periodFn } from "@/data/packages/period";
import { isoDay, rangeDays } from "@/shared/lib/date";
import { platformLabel } from "@/shared/lib/format";
import { query } from "@/shared/lib/query";

export type MetricId = "playtime" | "streams" | "days" | "tracks";

export type Point = { start: string; value: number };

const metricFn = async ({ scope, measure }: { scope: Scope; measure: MetricId }) => {
  const filter = scopeFilter(scope);
  const unit = unitFor(rangeDays(filter));
  const [total, trend] = await Promise.all([
    totals(filter, [measure]),
    series(filter, [measure], unit),
  ]);
  return {
    value: total[measure],
    unit,
    trend: trend.points.map((point) => ({ start: point.key, value: point[measure] })),
  };
};

export type OverTime = {
  // The scope the points are for, so a view keeps them only while the scope stays the same.
  scope: string;
  unit: Unit;
  points: Point[];
  // Day of the newest play in the package (YYYY-MM-DD), whatever the filters: buckets after it
  // have no data yet. Null when the package is empty.
  last: string | null;
};

export const scopeKey = ({ from, to, artistId }: Scope) =>
  `${isoDay(from)}|${isoDay(to)}|${artistId ?? ""}`;

const overTimeFn = async ({ scope, unit }: { scope: Scope; unit: Unit }) => {
  const [trend, period] = await Promise.all([
    series(scopeFilter(scope), ["playtime"], unit),
    periodFn(),
  ]);
  return {
    scope: scopeKey(scope),
    unit,
    points: trend.points.map((point) => ({ start: point.key, value: point.playtime })),
    last: period?.endDate ?? null,
  };
};

// Minutes listened in local time: by weekday, Monday first, and by hour, midnight first.
export type Rhythm = { grid: number[][]; days: number[]; hours: number[] };

const rhythmFn = async (scope: Scope) => {
  const rows = await aggregate({ by: "hour", measures: ["playtime"], filter: scopeFilter(scope) });
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const row of rows) {
    const date = new Date(row.key * 1000);
    const cells = grid[(date.getDay() + 6) % 7];
    const hour = date.getHours();
    if (cells) cells[hour] = (cells[hour] ?? 0) + row.playtime;
  }
  return {
    grid,
    days: grid.map((cells) => cells.reduce((sum, value) => sum + value, 0)),
    hours: Array.from({ length: 24 }, (_, hour) =>
      grid.reduce((sum, cells) => sum + (cells[hour] ?? 0), 0),
    ),
  };
};

export type PlatformPoint = { label: string; value: number };

const platformsFn = async (scope: Scope) => {
  const rows = await aggregate<"streams", string>({
    by: "platform",
    measures: ["streams"],
    filter: scopeFilter(scope),
  });
  return rows
    .sort((a, b) => b.streams - a.streams || a.key.localeCompare(b.key))
    .map((row) => ({ label: platformLabel(row.key), value: row.streams }));
};

export type StyleMetric = {
  key: "finished" | "skipped" | "shuffle" | "offline";
  label: string;
  value: number;
};

const STYLES = [
  ["finished", "finishedRate", "Finished"],
  ["skipped", "skipRate", "Skipped"],
  ["shuffle", "shuffleRate", "Shuffle"],
  ["offline", "offlineRate", "Offline"],
] as const;

const styleFn = async (scope: Scope) => {
  const total = await totals(
    scopeFilter(scope),
    STYLES.map(([, measure]) => measure),
  );
  return STYLES.map(([key, measure, label]) => ({ key, label, value: total[measure] }));
};

export type ReplayStage = { label: string; value: number };

const STAGES = [
  [1, "Unique Tracks"],
  [2, "Played Twice"],
  [5, "Played 5 Times"],
  [20, "Played 20 Times"],
  [50, "Favorites (50+)"],
] as const;

const replaysFn = async (scope: Scope) => {
  const rows = await aggregate({ by: "track", measures: ["streams"], filter: scopeFilter(scope) });
  return STAGES.map(([plays, label]) => ({
    label,
    value: rows.filter((row) => row.streams >= plays).length,
  }));
};

export type ReleaseYearPoint = {
  name: string;
  value: number;
  album: string | null;
};

// Streams by the release year of their album. Some catalog dates are placeholders such as
// year 10, so years before 1900 are left out.
const releaseYearFn = async (scope: Scope) => {
  const { rows } = await listFn({
    base: "albums",
    filter: scopeFilter(scope),
    sort: "streams",
    desc: true,
    limit: 1_000_000,
  });
  const years = new Map<string, ReleaseYearPoint>();
  for (const row of rows) {
    const year = typeof row.releaseYear === "string" ? row.releaseYear : null;
    if (!year || Number(year) < 1900) continue;
    const point = years.get(year) ?? { name: year, value: 0, album: row.name };
    point.value += Number(row.streams);
    years.set(year, point);
  }
  return [...years.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export type GenreSegment = {
  key: string;
  label: string;
  value: number;
  share: number;
};

const genresFn = async (scope: Scope) => {
  const rows = await aggregate<"streams", string>({
    by: "genre",
    measures: ["streams"],
    filter: scopeFilter(scope),
  });
  const total = rows.reduce((sum, row) => sum + row.streams, 0);
  return rows
    .sort((a, b) => b.streams - a.streams || a.key.localeCompare(b.key))
    .slice(0, 5)
    .map((row, index) => ({
      key:
        row.key
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "") || `genre_${index}`,
      label: row.key,
      value: row.streams,
      share: total > 0 ? row.streams / total : 0,
    }));
};

export const listeningQueries = {
  metric: query("listening-metric", metricFn),
  overTime: query("listening-over-time", overTimeFn),
  rhythm: query("listening-rhythm", rhythmFn),
  platforms: query("listening-platforms", platformsFn),
  style: query("listening-style", styleFn),
  replays: query("listening-replays", replaysFn),
  releaseYear: query("listening-release-year", releaseYearFn),
  genres: query("listening-genres", genresFn),
};
