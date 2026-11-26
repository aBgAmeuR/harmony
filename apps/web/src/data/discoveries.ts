import { db } from "@harmony/duckdb";

import type { Range } from "@/shared/lib/date";

import { day } from "./sql";

export const SPARK_WEEKS = 12;

const PASSED_WEEKS = 4;
const QUIET_DAYS = 28;

const BREAK_DAYS = 365;

const RELEASE_DAYS = 7;

const MIN_MINUTES = 10;

type Spark = Record<`s${number}`, number>;

type FindRow = Spark & {
  id: number;
  name: string;
  sub: string | null;
  image: string | null;
  start: string;
  last: string;
  minutes: number;
  weeks: number;
};

export type Find = {
  id: number;
  name: string;
  sub: string | null;
  image: string | null;
  start: string;
  last: string;
  minutes: number;
  weeks: number;
  spark: number[];
};

export type Discovery = Find & { passed: boolean };

export type Return = Find & { away: number };

export type AtRelease = Find & { days: number };

const inRange = (column: string, { from, to }: Range) =>
  `CAST(${column} AS DATE) BETWEEN ${day(from)} AND ${day(to)}`;

const lastDay = ({ to }: Range) =>
  `LEAST(${day(to)}, (SELECT MAX(CAST(ts AS DATE)) FROM interactions))`;

const ARTIST_PLAYS = `
  ap AS (
    SELECT u.artist_id AS key, i.ts, i.ms_played, i.track_id
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    CROSS JOIN unnest(t.artists) AS u(artist_id)
  )`;

const ALBUM_PLAYS = `
  ab AS (
    SELECT t.album_id AS key, i.ts, i.ms_played
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    JOIN albums al ON al.id = t.album_id
    WHERE COALESCE(al.album_type, '') <> 'single'
  )`;

const weeks = Array.from({ length: SPARK_WEEKS }, (_, n) => n);

const sparkSums = weeks
  .map(
    (n) => `(COALESCE(SUM(p.ms_played) FILTER (WHERE p.n = ${n}), 0) / 60000.0)::DOUBLE AS s${n}`,
  )
  .join(", ");

const sparkNames = weeks.map((n) => `s.s${n}`).join(", ");

type FindsOptions = {
  range: Range;
  ctes: string;
  plays: string;
  extra: string;
  joins: string;
  named: string;
  order: string;
};

const findsSql = ({ range, ctes, plays, extra, joins, named, order }: FindsOptions) => `
  WITH ${ctes},
  p AS (
    SELECT x.key, pl.ts, pl.ms_played,
      (date_diff('day', CAST(x.start AS DATE), CAST(pl.ts AS DATE)) // 7)::INTEGER AS n
    FROM items x
    JOIN ${plays} pl ON pl.key = x.key AND pl.ts >= x.start AND CAST(pl.ts AS DATE) <= ${day(range.to)}
  ),
  stats AS (
    SELECT p.key,
      (SUM(p.ms_played) / 60000.0)::DOUBLE AS minutes,
      COUNT(DISTINCT p.n)::INTEGER AS weeks,
      strftime(MAX(p.ts), '%Y-%m-%d') AS last,
      ${sparkSums}
    FROM p
    GROUP BY p.key
  )
  SELECT x.key::INTEGER AS id, strftime(x.start, '%Y-%m-%d') AS start, ${extra},
    s.minutes, s.weeks, s.last, ${sparkNames}, ${named}
  FROM items x
  JOIN stats s ON s.key = x.key
  ${joins}
  ORDER BY ${order}, x.key`;

const findOf = (row: FindRow) => ({
  id: row.id,
  name: row.name,
  sub: row.sub,
  image: row.image,
  start: row.start,
  last: row.last,
  minutes: row.minutes,
  weeks: row.weeks,
  spark: weeks.map((n) => row[`s${n}`] ?? 0),
});

const ARTIST_NAMED = {
  joins: `
    JOIN artists a ON a.id = x.key`,
  named: `a.name, NULL::VARCHAR AS sub, a.image`,
};

export const discoveriesFn = async (range: Range) => {
  const rows = await db.query<FindRow & { quiet: boolean }>(
    findsSql({
      range,
      ctes: `${ARTIST_PLAYS},
        items AS (
          SELECT key, MIN(ts) AS start
          FROM ap
          GROUP BY key
          HAVING ${inRange("MIN(ts)", range)}
        )`,
      plays: "ap",
      extra: `date_diff('day', CAST(s.last AS DATE), ${lastDay(range)}) >= ${QUIET_DAYS} AS quiet`,
      ...ARTIST_NAMED,
      order: "s.minutes DESC",
    }),
  );
  return rows
    .filter((row) => row.minutes >= MIN_MINUTES)
    .map((row) => ({ ...findOf(row), passed: row.quiet && row.weeks <= PASSED_WEEKS }));
};

export const returnsFn = async (range: Range) => {
  const rows = await db.query<FindRow & { away: number }>(
    findsSql({
      range,
      ctes: `${ARTIST_PLAYS},
        gaps AS (
          SELECT key, ts, track_id,
            date_diff(
              'day',
              CAST(LAG(ts) OVER (PARTITION BY key ORDER BY ts) AS DATE),
              CAST(ts AS DATE)
            ) AS away
          FROM ap
        ),
        items AS (
          SELECT key, MIN(ts) AS start,
            arg_min(away, ts)::INTEGER AS away
          FROM gaps
          WHERE away >= ${BREAK_DAYS} AND ${inRange("ts", range)}
          GROUP BY key
        )`,
      plays: "ap",
      extra: "x.away",
      ...ARTIST_NAMED,
      order: "s.minutes DESC",
    }),
  );
  return rows
    .filter((row) => row.minutes >= MIN_MINUTES)
    .map((row) => ({ ...findOf(row), away: row.away }));
};

export const atReleaseFn = async (range: Range) => {
  const rows = await db.query<FindRow & { days: number }>(
    findsSql({
      range,
      ctes: `${ALBUM_PLAYS},
        items AS (
          SELECT ab.key, MIN(ab.ts) AS start,
            date_diff('day', al.release_date, CAST(MIN(ab.ts) AS DATE))::INTEGER AS days
          FROM ab
          JOIN albums al ON al.id = ab.key
          WHERE CAST(ab.ts AS DATE) >= al.release_date
          GROUP BY ab.key, al.release_date
          HAVING date_diff('day', al.release_date, CAST(MIN(ab.ts) AS DATE)) <= ${RELEASE_DAYS}
            AND ${inRange("MIN(ab.ts)", range)}
        )`,
      plays: "ab",
      extra: "x.days",
      joins: "JOIN albums al ON al.id = x.key",
      named: `
        COALESCE(al.title, 'Unknown album') AS name,
        (
          SELECT string_agg(a.name, ', ' ORDER BY u.n)
          FROM unnest(al.artists) WITH ORDINALITY AS u(artist_id, n)
          JOIN artists a ON a.id = u.artist_id
        ) AS sub,
        al.image`,
      order: "x.days, s.minutes DESC",
    }),
  );
  return rows
    .filter((row) => row.minutes >= MIN_MINUTES)
    .map((row) => ({ ...findOf(row), days: row.days }));
};

export type DiscoverySummary = {
  fresh: boolean;
  artists: number;
  minutes: number;
  newMinutes: number;
  newAlbums: number;
};

export const discoverySummaryFn = async (range: Range) => {
  const [row] = await db.query<DiscoverySummary>(`
    WITH ${ARTIST_PLAYS},
    ${ALBUM_PLAYS},
    found AS (
      SELECT key
      FROM ap
      GROUP BY key
      HAVING ${inRange("MIN(ts)", range)}
        AND SUM(ms_played) FILTER (WHERE CAST(ts AS DATE) <= ${day(range.to)}) >= ${MIN_MINUTES * 60000}
    )
    SELECT
      COALESCE((SELECT MIN(CAST(ts AS DATE)) FROM interactions) >= ${day(range.from)}, TRUE)
        AS fresh,
      (SELECT COUNT(DISTINCT key) FROM ap WHERE ${inRange("ts", range)})::INTEGER AS artists,
      (
        SELECT COALESCE(SUM(ms_played), 0) / 60000.0
        FROM interactions
        WHERE ${inRange("ts", range)}
      )::DOUBLE AS minutes,
      (
        SELECT COALESCE(SUM(i.ms_played), 0) / 60000.0
        FROM interactions i
        JOIN tracks t ON t.id = i.track_id
        WHERE ${inRange("i.ts", range)}
          AND EXISTS (SELECT 1 FROM unnest(t.artists) AS u(artist_id) JOIN found f ON f.key = u.artist_id)
      )::DOUBLE AS "newMinutes",
      (
        SELECT COUNT(*) FROM (SELECT key FROM ab GROUP BY key HAVING ${inRange("MIN(ts)", range)})
      )::INTEGER AS "newAlbums"
  `);
  return row ?? { fresh: true, artists: 0, minutes: 0, newMinutes: 0, newAlbums: 0 };
};
