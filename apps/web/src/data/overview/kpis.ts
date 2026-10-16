import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere, toSqlDate } from "@/data/sql/date-range";

import {
  bucketCount,
  buildBuckets,
  bucketUnit,
  previousRange,
  type Buckets,
  type Range,
  type Unit,
} from "./range";

export type Totals = {
  minutes: number;
  streams: number;
  artists: number;
  tracks: number;
  days: number;
};

export type Series = {
  minutes: number[];
  streams: number[];
  artists: number[];
  days: number[];
};

export type Window = {
  from: string;
  to: string;
  totals: Totals;
  series: Series;
};

export type Overview = {
  unit: Unit;
  days: number;
  labels: string[];
  ticks: string[];
  prevLabels: string[];
  current: Window;
  previous: Window;
};

type TotalsRow = { minutes: number; streams: number; tracks: number; days: number };
type BucketRow = { b: number; minutes: number; streams: number; days: number; artists: number };

const totalsFn = async (range: Range): Promise<Totals> => {
  const where = joinWhere(interactionDateConditions(range.from, range.to));

  const [totals, artists] = await Promise.all([
    db.query<TotalsRow>(`
      SELECT
        (COALESCE(SUM(i.ms_played), 0) / 60000.0)::DOUBLE AS minutes,
        COUNT(*)::INTEGER AS streams,
        COUNT(DISTINCT i.track_id)::INTEGER AS tracks,
        COUNT(DISTINCT CAST(i.ts AS DATE))::INTEGER AS days
      FROM interactions i
      ${where}
    `),
    db.query<{ value: number }>(`
      SELECT COUNT(DISTINCT u.artist_id)::INTEGER AS value
      FROM interactions i
      JOIN tracks t ON t.id = i.track_id
      CROSS JOIN unnest(t.artists) AS u(artist_id)
      ${where}
    `),
  ]);

  const row = totals[0];
  return {
    minutes: row?.minutes ?? 0,
    streams: row?.streams ?? 0,
    tracks: row?.tracks ?? 0,
    days: row?.days ?? 0,
    artists: artists[0]?.value ?? 0,
  };
};

const seriesFn = async (range: Range, buckets: Buckets): Promise<Series> => {
  const where = joinWhere(interactionDateConditions(range.from, range.to));

  const rows = await db.query<BucketRow>(`
    WITH base AS (
      SELECT
        ${buckets.index} AS b,
        i.ms_played,
        CAST(i.ts AS DATE) AS d,
        t.artists
      FROM interactions i
      JOIN tracks t ON t.id = i.track_id
      ${where}
    ),
    per AS (
      SELECT
        b,
        SUM(ms_played) / 60000.0 AS minutes,
        COUNT(*) AS streams,
        COUNT(DISTINCT d) AS days
      FROM base
      GROUP BY b
    ),
    art AS (
      SELECT b, COUNT(DISTINCT u.artist_id) AS artists
      FROM base
      CROSS JOIN unnest(base.artists) AS u(artist_id)
      GROUP BY b
    )
    SELECT
      g.b::INTEGER AS b,
      COALESCE(per.minutes, 0)::DOUBLE AS minutes,
      COALESCE(per.streams, 0)::INTEGER AS streams,
      COALESCE(per.days, 0)::INTEGER AS days,
      COALESCE(art.artists, 0)::INTEGER AS artists
    FROM range(0, ${buckets.count}) AS g(b)
    LEFT JOIN per ON per.b = g.b
    LEFT JOIN art ON art.b = g.b
    ORDER BY g.b
  `);

  return {
    minutes: rows.map((r) => r.minutes),
    streams: rows.map((r) => r.streams),
    artists: rows.map((r) => r.artists),
    days: rows.map((r) => r.days),
  };
};

const windowFn = async (range: Range, buckets: Buckets): Promise<Window> => {
  const [totals, series] = await Promise.all([totalsFn(range), seriesFn(range, buckets)]);
  return { from: toSqlDate(range.from), to: toSqlDate(range.to), totals, series };
};

export const overviewFn = async (range: Range, full: Range = range): Promise<Overview> => {
  const prev = previousRange(range, full);
  const unit = bucketUnit(range);
  const count = bucketCount(range, unit);

  const current = buildBuckets(range, unit, count);
  const previous = buildBuckets(prev, unit, count);

  const [cur, old] = await Promise.all([windowFn(range, current), windowFn(prev, previous)]);

  return {
    unit,
    days: Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000) + 1,
    labels: current.labels,
    ticks: current.ticks,
    prevLabels: previous.labels,
    current: cur,
    previous: old,
  };
};
