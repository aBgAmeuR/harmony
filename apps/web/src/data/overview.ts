import { db } from "@harmony/duckdb";

import {
  addDays,
  isoDay,
  monthCount,
  previousRange,
  rangeDays,
  type Range,
} from "@/shared/lib/date";

import { aggregate, series, totals, type Unit } from "./aggregate";
import { topFn } from "./bases";
import { playsFrom } from "./filter";
import { day } from "./sql";
import { streakFn } from "./streak";

const MEASURES = ["playtime", "streams", "artists", "tracks", "days"] as const;

export type Totals = {
  minutes: number;
  streams: number;
  artists: number;
  tracks: number;
  days: number;
};

export type Series = { minutes: number[]; streams: number[]; artists: number[]; days: number[] };

type Window = { from: string; to: string; totals: Totals; series: Series };

export type Overview = {
  unit: Unit;
  days: number;
  labels: string[];
  ticks: string[];
  current: Window;
  previous: Window;
};

// The Overview chart is denser than the others: days up to a quarter, weeks up to two years.
const overviewUnit = (range: Range): Unit => {
  const days = rangeDays(range);
  if (days <= 92) return "day";
  return days <= 800 ? "week" : "month";
};

const bucketCount = (range: Range, unit: Unit): number => {
  if (unit === "day") return rangeDays(range);
  if (unit === "week") return Math.ceil(rangeDays(range) / 7);
  return monthCount(range);
};

const shortMonth = (date: Date): string => date.toLocaleDateString("en-US", { month: "short" });

// Positional buckets, so the current and previous ranges line up index by index.
const bucketLabels = ({ from }: Range, unit: Unit, count: number) => {
  const starts = Array.from({ length: count }, (_, n) =>
    unit === "month"
      ? new Date(from.getFullYear(), from.getMonth() + n, 1)
      : addDays(from, n * (unit === "week" ? 7 : 1)),
  );
  // Labels are x categories, so they must stay unique when the range crosses a year.
  const withYear = unit === "month" || starts[0]?.getFullYear() !== starts.at(-1)?.getFullYear();
  const labels = starts.map((date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      ...(unit === "month" ? {} : { day: "numeric" }),
      ...(withYear ? { year: "numeric" } : {}),
    }),
  );
  // Weekly charts name each month once, on its first week.
  const ticks =
    unit === "week"
      ? starts.map((date, n) =>
          n === 0 || date.getMonth() !== starts[n - 1]?.getMonth() ? shortMonth(date) : "",
        )
      : labels;
  return { labels, ticks };
};

const windowFn = async (range: Range, unit: Unit, count: number): Promise<Window> => {
  const [total, rows] = await Promise.all([
    totals(range, MEASURES),
    aggregate({
      by: { bucket: unit, origin: range.from, count },
      measures: ["playtime", "streams", "artists", "days"],
      filter: range,
      fill: true,
    }),
  ]);
  return {
    from: isoDay(range.from),
    to: isoDay(range.to),
    totals: {
      minutes: total.playtime,
      streams: total.streams,
      artists: total.artists,
      tracks: total.tracks,
      days: total.days,
    },
    series: {
      minutes: rows.map((row) => row.playtime),
      streams: rows.map((row) => row.streams),
      artists: rows.map((row) => row.artists),
      days: rows.map((row) => row.days),
    },
  };
};

// The period against the same stretch before it. `full` is the period picked, `range` may end
// earlier, on the last day of the package. `picked` overrides the bucket unit.
export const overviewFn = async ({
  range,
  full,
  unit: picked,
}: {
  range: Range;
  full: Range;
  unit?: Unit;
}): Promise<Overview> => {
  const unit = picked ?? overviewUnit(range);
  const count = bucketCount(range, unit);
  const previous = previousRange(range, full);
  const [current, old] = await Promise.all([
    windowFn(range, unit, count),
    windowFn(previous, unit, count),
  ]);
  return {
    unit,
    days: rangeDays(range),
    ...bucketLabels(range, unit, count),
    current,
    previous: old,
  };
};

export type Highlights = {
  peakDay: { date: string; minutes: number; streams: number } | null;
  // Minutes of every day in the month of the peak day, days without plays included.
  peakMonth: { date: string; minutes: number }[];
  streak: { days: number; start: string | null; end: string | null };
  // null when the range starts with the package, where every artist would count as new
  newArtists: number | null;
  replayed: {
    name: string;
    description: string | null;
    image: string | null;
    streams: number;
  } | null;
};

// Artists whose first play ever falls in the range.
const newArtistsFn = async ({ from, to }: Range): Promise<number | null> => {
  const [row] = await db.query<{ value: number | null }>(`
    WITH firsts AS (
      SELECT MIN(CAST(i.ts AS DATE)) AS first_day
      ${playsFrom({}, { needs: ["track"], joins: "CROSS JOIN unnest(t.artists) AS u(artist_id)" })}
      GROUP BY u.artist_id
    )
    SELECT
      CASE
        WHEN (SELECT MIN(CAST(ts AS DATE)) FROM interactions) >= ${day(from)} THEN NULL
        ELSE COUNT(*) FILTER (WHERE first_day BETWEEN ${day(from)} AND ${day(to)})
      END::INTEGER AS value
    FROM firsts
  `);
  return row?.value ?? null;
};

export const highlightsFn = async (range: Range): Promise<Highlights> => {
  const [days, streak, newArtists, [top]] = await Promise.all([
    aggregate<"playtime" | "streams", string>({
      by: "day",
      measures: ["playtime", "streams"],
      filter: range,
    }),
    streakFn(range),
    newArtistsFn(range),
    topFn({ base: "tracks", filter: range, sort: "streams", limit: 1 }),
  ]);

  const peak = days.reduce<(typeof days)[number] | undefined>(
    (best, row) => (!best || row.playtime > best.playtime ? row : best),
    undefined,
  );
  const peakDay = peak ? { date: peak.key, minutes: peak.playtime, streams: peak.streams } : null;

  const month = peak
    ? new Date(Number(peak.key.slice(0, 4)), Number(peak.key.slice(5, 7)) - 1, 1)
    : null;
  const peakMonth = month
    ? (
        await series(
          { from: month, to: new Date(month.getFullYear(), month.getMonth() + 1, 0) },
          ["playtime"],
          "day",
        )
      ).points.map((point) => ({ date: point.key, minutes: point.playtime }))
    : [];

  return {
    peakDay,
    peakMonth,
    streak: { days: streak.longestDays, start: streak.longestStart, end: streak.longestEnd },
    newArtists,
    replayed: top
      ? { name: top.name, description: top.description, image: top.image, streams: top.streams }
      : null,
  };
};
