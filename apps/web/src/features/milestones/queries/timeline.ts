import { db } from "@harmony/duckdb";

import { formatCount } from "../format";
import { ARTIST_RUNGS, HOUR_RUNGS, STREAM_RUNGS, TRACK_RUNGS, type TimelineEvent } from "../types";
import {
  buildListeningFilter,
  sqlRungValues,
  tracksJoin,
  type ListeningRangeParams,
} from "./filter";

type EventKind = "hours" | "streams" | "artists" | "tracks" | "first";

type LogRow = {
  date: string;
  event_kind: string;
  threshold: number;
  entity: string | null;
  subtitle: string | null;
  image: string | null;
};

function isEventKind(value: string): value is EventKind {
  return (
    value === "hours" ||
    value === "streams" ||
    value === "artists" ||
    value === "tracks" ||
    value === "first"
  );
}

function eventLabel(kind: EventKind, threshold: number): string {
  if (kind === "hours") return `${formatCount(threshold)} hours listened`;
  if (kind === "streams") return `${formatCount(threshold)} streams reached`;
  if (kind === "artists") return `${formatCount(threshold)} unique artists`;
  if (kind === "tracks") return `${formatCount(threshold)} unique tracks`;
  return "First listen";
}

function toEvent(row: LogRow): TimelineEvent | null {
  if (!isEventKind(row.event_kind)) return null;
  return {
    id: `${row.event_kind}-${row.threshold}-${row.date}`,
    date: row.date,
    label: eventLabel(row.event_kind, row.threshold),
    entity: row.entity ?? "",
    subtitle: row.subtitle ?? "",
    image: row.image,
  };
}

export const timelineFn = async (params: ListeningRangeParams): Promise<TimelineEvent[]> => {
  const { artistJoin, where } = buildListeningFilter(params);
  const join = tracksJoin(params);

  const rows = await db.query<LogRow>(`
    WITH plays AS (
      SELECT i.ts, i.track_id, i.ms_played
      FROM interactions i
      ${artistJoin}
      ${where}
    ),
    ordered AS (
      SELECT
        ts,
        track_id,
        SUM(ms_played) OVER w AS cum_ms,
        COUNT(*) OVER w AS cum_n
      FROM plays
      WINDOW w AS (ORDER BY ts, track_id ROWS UNBOUNDED PRECEDING)
    ),
    lagged AS (
      SELECT
        ts,
        track_id,
        cum_ms,
        cum_n,
        COALESCE(LAG(cum_ms) OVER (ORDER BY ts, track_id), 0) AS prev_ms,
        COALESCE(LAG(cum_n) OVER (ORDER BY ts, track_id), 0) AS prev_n
      FROM ordered
    ),
    hour_events AS (
      SELECT
        CAST(CAST(l.ts AS DATE) AS VARCHAR) AS date,
        'hours' AS event_kind,
        t.threshold::INTEGER AS threshold,
        v.track_name AS entity,
        v.track_artists_description AS subtitle,
        v.image AS image
      FROM lagged l
      JOIN (VALUES ${sqlRungValues(HOUR_RUNGS)}) AS t(threshold)
        ON l.prev_ms / 3600000.0 < t.threshold
       AND l.cum_ms / 3600000.0 >= t.threshold
      JOIN v_tracks_info v ON v.track_id = l.track_id
    ),
    stream_events AS (
      SELECT
        CAST(CAST(l.ts AS DATE) AS VARCHAR) AS date,
        'streams' AS event_kind,
        t.threshold::INTEGER AS threshold,
        v.track_name AS entity,
        v.track_artists_description AS subtitle,
        v.image AS image
      FROM lagged l
      JOIN (VALUES ${sqlRungValues(STREAM_RUNGS)}) AS t(threshold)
        ON l.prev_n < t.threshold
       AND l.cum_n >= t.threshold
      JOIN v_tracks_info v ON v.track_id = l.track_id
    ),
    track_firsts AS (
      SELECT i.track_id, MIN(i.ts) AS first_ts
      FROM interactions i
      ${artistJoin}
      ${where}
      GROUP BY i.track_id
    ),
    track_ranked AS (
      SELECT
        track_id,
        first_ts,
        ROW_NUMBER() OVER (ORDER BY first_ts, track_id)::INTEGER AS n
      FROM track_firsts
    ),
    track_events AS (
      SELECT
        CAST(CAST(r.first_ts AS DATE) AS VARCHAR) AS date,
        'tracks' AS event_kind,
        t.threshold::INTEGER AS threshold,
        v.track_name AS entity,
        v.track_artists_description AS subtitle,
        v.image AS image
      FROM track_ranked r
      JOIN (VALUES ${sqlRungValues(TRACK_RUNGS)}) AS t(threshold) ON r.n = t.threshold
      JOIN v_tracks_info v ON v.track_id = r.track_id
    ),
    artist_firsts AS (
      SELECT u.artist_id, MIN(i.ts) AS first_ts
      FROM interactions i
      ${join}
      CROSS JOIN unnest(t.artists) AS u(artist_id)
      ${where}
      GROUP BY u.artist_id
    ),
    artist_ranked AS (
      SELECT
        artist_id,
        first_ts,
        ROW_NUMBER() OVER (ORDER BY first_ts, artist_id)::INTEGER AS n
      FROM artist_firsts
    ),
    artist_events AS (
      SELECT
        CAST(CAST(r.first_ts AS DATE) AS VARCHAR) AS date,
        'artists' AS event_kind,
        t.threshold::INTEGER AS threshold,
        a.name AS entity,
        '' AS subtitle,
        a.image AS image
      FROM artist_ranked r
      JOIN (VALUES ${sqlRungValues(ARTIST_RUNGS)}) AS t(threshold) ON r.n = t.threshold
      JOIN artists a ON a.id = r.artist_id
    ),
    first_event AS (
      SELECT
        CAST(CAST(i.ts AS DATE) AS VARCHAR) AS date,
        'first' AS event_kind,
        1 AS threshold,
        v.track_name AS entity,
        v.track_artists_description AS subtitle,
        v.image AS image
      FROM interactions i
      ${artistJoin}
      JOIN v_tracks_info v ON v.track_id = i.track_id
      ${where}
      ORDER BY i.ts, i.track_id
      LIMIT 1
    )
    SELECT * FROM hour_events
    UNION ALL
    SELECT * FROM stream_events
    UNION ALL
    SELECT * FROM track_events
    UNION ALL
    SELECT * FROM artist_events
    UNION ALL
    SELECT * FROM first_event
    ORDER BY date DESC
  `);

  return rows.flatMap((row) => {
    const event = toEvent(row);
    return event ? [event] : [];
  });
};
