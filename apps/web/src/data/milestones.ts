import { db } from "@harmony/duckdb";

import { totals } from "./aggregate";
import { sessionsSql } from "./bases";
import { playsFrom, type Filter } from "./filter";

const HOUR_RUNGS = [10, 50, 100, 250, 500, 1000, 2500, 5000, 7000, 10_000] as const;
const STREAM_RUNGS = [100, 1000, 5000, 10_000, 25_000, 50_000, 100_000] as const;
const ARTIST_RUNGS = [50, 100, 250, 500, 1000, 2500, 5000] as const;
const TRACK_RUNGS = [100, 500, 1000, 5000, 10_000] as const;

export const summaryFn = async (filter: Filter) => {
  const total = await totals(filter, ["days", "streams", "firstPlayed"]);
  return { listeningDays: total.days, streams: total.streams, rangeStart: total.firstPlayed };
};

export type NextMilestone = {
  id: "hours" | "streams" | "artists" | "tracks";
  label: string;
  current: number;
  target: number;
  remaining: number;
  progress: number;
  reached: boolean;
};

const toBar = (
  id: NextMilestone["id"],
  label: string,
  current: number,
  ladder: readonly number[],
) => {
  const target = ladder.find((rung) => current < rung);
  const last = ladder.at(-1) ?? current;
  return {
    id,
    label,
    current,
    target: target ?? last,
    remaining: target === undefined ? 0 : target - current,
    progress: Math.min(1, current / (target ?? last)),
    reached: target === undefined,
  };
};

export const nextMilestonesFn = async (filter: Filter) => {
  const total = await totals(filter, ["playtime", "streams", "artists", "tracks"]);
  const hours = Math.round((total.playtime / 60) * 10) / 10;
  return [
    toBar("hours", "Hours", hours, HOUR_RUNGS),
    toBar("streams", "Streams", total.streams, STREAM_RUNGS),
    toBar("artists", "Unique artists", total.artists, ARTIST_RUNGS),
    toBar("tracks", "Unique tracks", total.tracks, TRACK_RUNGS),
  ];
};

export type Sessions = {
  sessions: number;
  avgMinutes: number;
  longestMinutes: number;
  longestStart: string | null;
};

export const sessionStatsFn = async (filter: Filter) => {
  const [row] = await db.query<Sessions>(`
    WITH sessions AS (${sessionsSql(filter)})
    SELECT
      COUNT(*)::INTEGER AS sessions,
      COALESCE(ROUND(AVG(duration_ms) / 60000.0, 1), 0)::DOUBLE AS "avgMinutes",
      COALESCE(ROUND(MAX(duration_ms) / 60000.0, 1), 0)::DOUBLE AS "longestMinutes",
      CAST((
        SELECT started FROM sessions ORDER BY duration_ms DESC, started ASC LIMIT 1
      ) AS VARCHAR) AS "longestStart"
    FROM sessions
  `);
  return row ?? { sessions: 0, avgMinutes: 0, longestMinutes: 0, longestStart: null };
};

export type Mark = {
  kind: "hours" | "streams" | "artists" | "tracks" | "first";
  threshold: number;
  date: string;
  entity: string | null;
  subtitle: string | null;
  image: string | null;
};

const rungs = (values: readonly number[]) => values.map((n) => `(${n})`).join(", ");

export const marksFn = async (filter: Filter) => {
  const plays = playsFrom(filter, { needs: ["track"] });
  return await db.query<Mark>(`
    WITH plays AS (SELECT i.ts, i.track_id, i.ms_played, t.artists ${plays}),
    running AS (
      SELECT ts, track_id,
        SUM(ms_played) OVER w AS cum_ms,
        COUNT(*) OVER w AS cum_n
      FROM plays
      WINDOW w AS (ORDER BY ts, track_id ROWS UNBOUNDED PRECEDING)
    ),
    lagged AS (
      SELECT *,
        COALESCE(LAG(cum_ms) OVER (ORDER BY ts, track_id), 0) AS prev_ms,
        COALESCE(LAG(cum_n) OVER (ORDER BY ts, track_id), 0) AS prev_n
      FROM running
    ),
    crossings AS (
      SELECT 'hours' AS kind, r.threshold, l.ts, l.track_id
      FROM lagged l
      JOIN (VALUES ${rungs(HOUR_RUNGS)}) AS r(threshold)
        ON l.prev_ms / 3600000.0 < r.threshold AND l.cum_ms / 3600000.0 >= r.threshold
      UNION ALL
      SELECT 'streams', r.threshold, l.ts, l.track_id
      FROM lagged l
      JOIN (VALUES ${rungs(STREAM_RUNGS)}) AS r(threshold)
        ON l.prev_n < r.threshold AND l.cum_n >= r.threshold
      UNION ALL
      SELECT 'tracks', r.threshold, f.first_ts, f.track_id
      FROM (
        SELECT track_id, MIN(ts) AS first_ts,
          ROW_NUMBER() OVER (ORDER BY MIN(ts), track_id) AS n
        FROM plays GROUP BY track_id
      ) f
      JOIN (VALUES ${rungs(TRACK_RUNGS)}) AS r(threshold) ON f.n = r.threshold
      UNION ALL
      SELECT 'first', 1, ts, track_id FROM (SELECT * FROM plays ORDER BY ts, track_id LIMIT 1)
    ),
    artist_rungs AS (
      SELECT 'artists' AS kind, r.threshold, f.first_ts AS ts, f.artist_id
      FROM (
        SELECT u.artist_id, MIN(p.ts) AS first_ts,
          ROW_NUMBER() OVER (ORDER BY MIN(p.ts), u.artist_id) AS n
        FROM plays p CROSS JOIN unnest(p.artists) AS u(artist_id)
        GROUP BY u.artist_id
      ) f
      JOIN (VALUES ${rungs(ARTIST_RUNGS)}) AS r(threshold) ON f.n = r.threshold
    )
    SELECT c.kind, c.threshold::INTEGER AS threshold, CAST(CAST(c.ts AS DATE) AS VARCHAR) AS date,
      v.track_name AS entity, v.track_artists_description AS subtitle, v.image
    FROM crossings c JOIN v_tracks_info v ON v.track_id = c.track_id
    UNION ALL
    SELECT a.kind, a.threshold::INTEGER, CAST(CAST(a.ts AS DATE) AS VARCHAR), ar.name, '', ar.image
    FROM artist_rungs a JOIN artists ar ON ar.id = a.artist_id
    ORDER BY date DESC
  `);
};

type Discovery = {
  id: number;
  date: string;
  name: string;
  image: string | null;
  laterRank: number;
};

export const firstsFn = async (filter: Filter) =>
  await db.query<Discovery>(`
    WITH stats AS (
      SELECT u.artist_id, MIN(i.ts) AS first_ts, SUM(i.ms_played) AS ms
      ${playsFrom(filter, { needs: ["track"], joins: "CROSS JOIN unnest(t.artists) AS u(artist_id)" })}
      GROUP BY u.artist_id
    ),
    ranked AS (
      SELECT *, ROW_NUMBER() OVER (ORDER BY ms DESC, artist_id ASC)::INTEGER AS later_rank
      FROM stats
    )
    SELECT a.id, CAST(CAST(r.first_ts AS DATE) AS VARCHAR) AS date, a.name, a.image,
      r.later_rank AS "laterRank"
    FROM ranked r JOIN artists a ON a.id = r.artist_id
    WHERE r.later_rank <= 50 AND r.ms >= 1800000 AND a.name IS NOT NULL
    ORDER BY r.first_ts ASC, a.id ASC
    LIMIT 12
  `);
