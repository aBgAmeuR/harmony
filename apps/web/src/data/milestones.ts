import { db } from "@harmony/duckdb";

import { addDays, isoDay, parseDay, rangeDays, type Range } from "@/shared/lib/date";

import { sessionsSql } from "./bases";

const TOTAL_RUNGS = [100, 1000, 10_000, 100_000, 1_000_000].flatMap((base) =>
  Array.from({ length: 9 }, (_, n) => (n + 1) * base),
);
const ENTITY_RUNGS = [250, 500, 1000, 2500, 5000, 10_000, 25_000, 50_000];
const ANNIVERSARY_STREAMS = 1000;
const ANNIVERSARIES = [5, 10, 15, 20, 25];
const HISTORY_START_DAYS = 30;
const PACE_DAYS = 90;
const ENTITIES_AHEAD = 2;
const HOUR = 3_600_000;

const list = (values: readonly number[]) => values.join(", ");
const rows = (values: readonly number[]) => values.map((n) => `(${n})`).join(", ");

export const within = (day: string, { from, to }: Range) =>
  day >= isoDay(from) && day <= isoDay(to);

export type Total = "hours" | "streams" | "tracks" | "artists";

export type Mark = {
  kind: Total | "artist" | "track" | "anniversary";
  threshold: number;
  date: string;
  id: number;
  name: string;
  sub: string;
  image: string | null;
};

export const marksFn = async () =>
  await db.query<Mark>(`
    WITH plays AS (
      SELECT i.ts, i.track_id, i.ms_played, t.artists,
        ROW_NUMBER() OVER w AS n,
        SUM(i.ms_played) OVER w AS ms
      FROM interactions i
      JOIN tracks t ON t.id = i.track_id
      WINDOW w AS (ORDER BY i.ts, i.track_id ROWS UNBOUNDED PRECEDING)
    ),
    artist_plays AS (
      SELECT p.ts, p.track_id, u.artist_id,
        ROW_NUMBER() OVER (PARTITION BY u.artist_id ORDER BY p.ts, p.track_id) AS k
      FROM plays p
      CROSS JOIN unnest(p.artists) AS u(artist_id)
    ),
    track_plays AS (
      SELECT ts, track_id, ROW_NUMBER() OVER (PARTITION BY track_id ORDER BY ts) AS k
      FROM plays
    ),
    first_artists AS (
      SELECT artist_id, ts, track_id, ROW_NUMBER() OVER (ORDER BY ts, artist_id) AS nth
      FROM artist_plays
      WHERE k = 1
    ),
    first_tracks AS (
      SELECT track_id, ts, ROW_NUMBER() OVER (ORDER BY ts, track_id) AS nth
      FROM track_plays
      WHERE k = 1
    ),
    marks AS (
      SELECT 'streams' AS kind, n AS threshold, ts, track_id, NULL::UINTEGER AS artist_id
      FROM plays
      WHERE n IN (${list(TOTAL_RUNGS)})
      UNION ALL
      SELECT 'hours', r.v, p.ts, p.track_id, NULL
      FROM plays p
      JOIN (VALUES ${rows(TOTAL_RUNGS)}) AS r(v)
        ON (p.ms - p.ms_played) / ${HOUR}.0 < r.v AND p.ms / ${HOUR}.0 >= r.v
      UNION ALL
      SELECT 'tracks', nth, ts, track_id, NULL
      FROM first_tracks
      WHERE nth IN (${list(TOTAL_RUNGS)})
      UNION ALL
      SELECT 'artists', nth, ts, track_id, artist_id
      FROM first_artists
      WHERE nth IN (${list(TOTAL_RUNGS)})
      UNION ALL
      SELECT 'artist', k, ts, track_id, artist_id
      FROM artist_plays
      WHERE k IN (${list(ENTITY_RUNGS)})
      UNION ALL
      SELECT 'track', k, ts, track_id, NULL
      FROM track_plays
      WHERE k IN (${list(ENTITY_RUNGS)})
      UNION ALL
      SELECT 'anniversary', y.v, f.ts + to_years(y.v), f.track_id, f.artist_id
      FROM first_artists f
      SEMI JOIN artist_plays a ON a.artist_id = f.artist_id AND a.k = ${ANNIVERSARY_STREAMS}
      JOIN (VALUES ${rows(ANNIVERSARIES)}) AS y(v)
        ON f.ts + to_years(y.v) <= (SELECT MAX(ts) FROM plays)
      WHERE f.ts >= (SELECT MIN(ts) FROM plays) + to_days(${HISTORY_START_DAYS})
    )
    SELECT m.kind, m.threshold::INTEGER AS threshold, strftime(m.ts, '%Y-%m-%d') AS date,
      COALESCE(m.artist_id, m.track_id) AS id,
      CASE WHEN m.artist_id IS NULL
        THEN COALESCE(v.track_name, 'Unknown track')
        ELSE COALESCE(a.name, 'Unknown artist')
      END AS name,
      CASE WHEN m.artist_id IS NULL
        THEN COALESCE(v.track_artists_description, 'Unknown artist')
        ELSE COALESCE(v.track_name, 'Unknown track')
      END AS sub,
      CASE WHEN m.artist_id IS NULL THEN v.image ELSE a.image END AS image
    FROM marks m
    LEFT JOIN artists a ON a.id = m.artist_id
    LEFT JOIN v_tracks_info v ON v.track_id = m.track_id
    WHERE m.kind IN ('hours', 'streams', 'tracks', 'artists')
      OR CASE WHEN m.artist_id IS NULL THEN v.track_name ELSE a.name END IS NOT NULL
    ORDER BY m.ts DESC, m.kind, m.threshold DESC
  `);

const units = {
  day: `
    SELECT CAST(ts AS DATE) AS start, CAST(ts AS DATE) AS finish,
      SUM(ms_played) / 60000.0 AS value, COUNT(*) AS n, NULL::UINTEGER AS track_id
    FROM interactions
    GROUP BY ALL`,
  week: `
    SELECT CAST(date_trunc('week', ts) AS DATE) AS start,
      CAST(date_trunc('week', ts) AS DATE) + 6 AS finish,
      SUM(ms_played) / 60000.0 AS value, COUNT(*) AS n, NULL::UINTEGER AS track_id
    FROM interactions
    GROUP BY ALL`,
  session: `
    SELECT CAST(started AS DATE) AS start, CAST(started AS DATE) AS finish,
      duration_ms / 60000.0 AS value, streams AS n, NULL::UINTEGER AS track_id
    FROM (${sessionsSql({})})`,
  streak: `
    SELECT MIN(d) AS start, MAX(d) AS finish, COUNT(*) AS value, SUM(n) AS n,
      NULL::UINTEGER AS track_id
    FROM (
      SELECT d, n, d - CAST(ROW_NUMBER() OVER (ORDER BY d) AS INTEGER) AS island
      FROM (SELECT CAST(ts AS DATE) AS d, COUNT(*) AS n FROM interactions GROUP BY 1)
    )
    GROUP BY island`,
  track: `
    SELECT CAST(ts AS DATE) AS start, CAST(ts AS DATE) AS finish, COUNT(*) AS value,
      COUNT(*) AS n, track_id
    FROM interactions
    GROUP BY ALL`,
  artists: `
    SELECT CAST(i.ts AS DATE) AS start, CAST(i.ts AS DATE) AS finish,
      COUNT(DISTINCT u.artist_id) AS value, COUNT(DISTINCT (i.ts, i.track_id)) AS n,
      NULL::UINTEGER AS track_id
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    CROSS JOIN unnest(t.artists) AS u(artist_id)
    GROUP BY ALL`,
};

export type Best = {
  id: keyof typeof units;
  value: number;
  start: string;
  finish: string;
  n: number;
  trackId: number | null;
  track: string | null;
  artists: string | null;
  image: string | null;
  prev: number | null;
  prevStart: string | null;
};

const bestSql = (id: string, position: number, sql: string) => `
  SELECT * FROM (
    WITH u AS (${sql}),
    best AS (SELECT * FROM u ORDER BY value DESC, start LIMIT 1),
    prior AS (
      SELECT u.value, u.start
      FROM u, best
      WHERE u.start < best.start
      ORDER BY u.value DESC, u.start
      LIMIT 1
    )
    SELECT '${id}' AS id, ${position} AS position, best.value::DOUBLE AS value,
      strftime(best.start, '%Y-%m-%d') AS start, strftime(best.finish, '%Y-%m-%d') AS finish,
      best.n::INTEGER AS n, best.track_id,
      prior.value::DOUBLE AS prev, strftime(prior.start, '%Y-%m-%d') AS prev_start
    FROM best
    LEFT JOIN prior ON TRUE
  )`;

export const recordsFn = async () =>
  await db.query<Best>(`
    SELECT r.id, r.value, r.start, r.finish, r.n, r.track_id AS "trackId",
      v.track_name AS track, v.track_artists_description AS artists, v.image,
      r.prev, r.prev_start AS "prevStart"
    FROM (
      ${Object.entries(units)
        .map(([id, sql], position) => bestSql(id, position, sql))
        .join(" UNION ALL ")}
    ) r
    LEFT JOIN v_tracks_info v ON v.track_id = r.track_id
    ORDER BY r.position
  `);

export type Next = {
  kind: Total | "artist" | "track";
  id: number | null;
  name: string | null;
  sub: string | null;
  image: string | null;
  current: number;
  previous: number;
  target: number;
  days: number;
  eta: string | null;
  passed: boolean;
};

type Now = {
  first: string | null;
  last: string | null;
} & { [K in Total]: number } & { [K in `${Total}Recent`]: number };

type Ahead = {
  kind: "artist" | "track";
  id: number;
  name: string;
  sub: string | null;
  image: string | null;
  current: number;
  recent: number;
};

const PLAYS = `
  plays AS (
    SELECT i.ts, i.track_id, i.ms_played, t.artists
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
  ),
  recent AS (SELECT MAX(CAST(ts AS DATE)) - ${PACE_DAYS} AS since FROM plays)`;

const nowFn = async () => {
  const [row] = await db.query<Now>(`
    WITH ${PLAYS},
    firsts AS (
      SELECT 'tracks' AS kind, MIN(ts) AS ts FROM plays GROUP BY track_id
      UNION ALL
      SELECT 'artists', MIN(p.ts)
      FROM plays p
      CROSS JOIN unnest(p.artists) AS u(artist_id)
      GROUP BY u.artist_id
    )
    SELECT
      strftime(MIN(ts), '%Y-%m-%d') AS first,
      strftime(MAX(ts), '%Y-%m-%d') AS last,
      (COALESCE(SUM(ms_played), 0) / ${HOUR}.0)::DOUBLE AS hours,
      (COALESCE(SUM(ms_played) FILTER (WHERE CAST(ts AS DATE) > since), 0) / ${HOUR}.0)::DOUBLE
        AS "hoursRecent",
      COUNT(*)::INTEGER AS streams,
      (COUNT(*) FILTER (WHERE CAST(ts AS DATE) > since))::INTEGER AS "streamsRecent",
      (SELECT COUNT(*) FROM firsts WHERE kind = 'tracks')::INTEGER AS tracks,
      (SELECT COUNT(*) FROM firsts, recent WHERE kind = 'tracks' AND CAST(ts AS DATE) > since)
        ::INTEGER AS "tracksRecent",
      (SELECT COUNT(*) FROM firsts WHERE kind = 'artists')::INTEGER AS artists,
      (SELECT COUNT(*) FROM firsts, recent WHERE kind = 'artists' AND CAST(ts AS DATE) > since)
        ::INTEGER AS "artistsRecent"
    FROM plays, recent
    GROUP BY since
  `);
  return row;
};

const aheadFn = async () =>
  await db.query<Ahead>(`
    WITH ${PLAYS},
    counts AS (
      SELECT 'artist' AS kind, u.artist_id AS id, COUNT(*) AS current,
        COUNT(*) FILTER (WHERE CAST(p.ts AS DATE) > r.since) AS recent
      FROM plays p
      CROSS JOIN unnest(p.artists) AS u(artist_id)
      CROSS JOIN recent r
      GROUP BY u.artist_id
      UNION ALL
      SELECT 'track', p.track_id, COUNT(*),
        COUNT(*) FILTER (WHERE CAST(p.ts AS DATE) > r.since)
      FROM plays p
      CROSS JOIN recent r
      GROUP BY p.track_id
    ),
    ahead AS (
      SELECT c.kind, c.id, c.current, c.recent, MIN(l.v) AS target
      FROM counts c
      JOIN (VALUES ${rows(ENTITY_RUNGS)}) AS l(v) ON l.v > c.current
      WHERE c.recent > 0
      GROUP BY c.kind, c.id, c.current, c.recent
    )
    SELECT x.kind, x.id, x.current::INTEGER AS current, x.recent::INTEGER AS recent,
      CASE WHEN x.kind = 'artist' THEN a.name ELSE v.track_name END AS name,
      CASE WHEN x.kind = 'artist'
        THEN NULL
        ELSE COALESCE(v.track_artists_description, 'Unknown artist')
      END AS sub,
      CASE WHEN x.kind = 'artist' THEN a.image ELSE v.image END AS image
    FROM ahead x
    LEFT JOIN artists a ON x.kind = 'artist' AND a.id = x.id
    LEFT JOIN v_tracks_info v ON x.kind = 'track' AND v.track_id = x.id
    WHERE CASE WHEN x.kind = 'artist' THEN a.name ELSE v.track_name END IS NOT NULL
    QUALIFY ROW_NUMBER() OVER (
      PARTITION BY x.kind
      ORDER BY (x.target - x.current) / x.recent, x.id
    ) <= ${ENTITIES_AHEAD}
  `);

const step = (
  pace: { last: string; days: number; today: string },
  ladder: readonly number[],
  current: number,
  recent: number,
) => {
  const target = ladder.find((rung) => rung > current);
  if (target === undefined) return [];
  const days = recent > 0 ? Math.ceil(((target - current) * pace.days) / recent) : Infinity;
  const eta = Number.isFinite(days) ? isoDay(addDays(parseDay(pace.last), days)) : null;
  return [
    {
      current,
      previous: ladder.findLast((rung) => rung <= current) ?? 0,
      target,
      days,
      eta,
      passed: eta !== null && eta < pace.today,
    },
  ];
};

export const nextFn = async () => {
  const [now, ahead] = await Promise.all([nowFn(), aheadFn()]);
  if (!now?.first || !now.last) {
    return { first: null, last: null, hours: 0, paceDays: PACE_DAYS, rows: [] };
  }
  const { first, last } = now;
  const paceDays = Math.min(PACE_DAYS, rangeDays({ from: parseDay(first), to: parseDay(last) }));
  const pace = { last, days: paceDays, today: isoDay(new Date()) };

  const totals = (["streams", "tracks", "artists", "hours"] as const).flatMap((kind) =>
    step(pace, TOTAL_RUNGS, now[kind], now[`${kind}Recent`]).map((progress) => ({
      kind,
      id: null,
      name: null,
      sub: null,
      image: null,
      ...progress,
    })),
  );

  const entities = ahead.flatMap(({ kind, id, name, sub, image, current, recent }) =>
    step(pace, ENTITY_RUNGS, current, recent).map((progress) => ({
      kind,
      id,
      name,
      sub,
      image,
      ...progress,
    })),
  );

  return {
    first,
    last,
    hours: now.hours,
    paceDays,
    rows: [...totals, ...entities].toSorted((a, b) => a.days - b.days),
  };
};

export const curveFn = async () =>
  await db.query<{ month: string; hours: number }>(`
    WITH m AS (
      SELECT date_trunc('month', ts) AS month, SUM(ms_played) AS ms
      FROM interactions
      GROUP BY 1
    ),
    s AS (
      SELECT unnest(range(
        (SELECT MIN(month) FROM m) - INTERVAL 1 MONTH,
        (SELECT MAX(month) FROM m) + INTERVAL 1 MONTH,
        INTERVAL 1 MONTH
      )) AS month
    )
    SELECT strftime(s.month, '%Y-%m') AS month,
      (SUM(COALESCE(m.ms, 0)) OVER (ORDER BY s.month) / ${HOUR}.0)::DOUBLE AS hours
    FROM s
    LEFT JOIN m USING (month)
    ORDER BY s.month
  `);
