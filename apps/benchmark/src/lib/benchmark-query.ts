export const BENCHMARK_PACKAGE_ID = "XdxmnG";

export const BENCHMARK_ITERATIONS = 50;

export const PRE_BENCHMARK_QUERY = ``;

const LIMIT = 50;
// const FROM = "2023-06-01";
// const TO = "2023-06-30";
const FROM = "2018-01-01";
const TO = "2026-06-30";
const ARTIST_ID = 10002824;

export const TOP_ARTISTS_SQL = `
  WITH filtered AS (
    SELECT
      i.track_id,
      i.ms_played
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    WHERE i.ts >= TIMESTAMP '${FROM}'
      AND i.ts < (DATE '${TO}' + INTERVAL 1 DAY)
  ),
  track_stats AS (
    SELECT
      f.track_id,
      COUNT(*)::INTEGER AS streams,
      SUM(f.ms_played) AS ms_played
    FROM filtered f
    GROUP BY f.track_id
  ),
  artist_stats AS (
    SELECT
      u.artist_id AS id,
      SUM(ts.streams)::INTEGER AS streams,
      SUM(ts.ms_played) AS ms_played
    FROM track_stats ts
    JOIN tracks t ON t.id = ts.track_id
    CROSS JOIN unnest(t.artists) AS u(artist_id)
    GROUP BY u.artist_id
  )
  SELECT
    s.id,
    a.name,
    a.image,
    s.streams,
    (s.ms_played / 60000)::INTEGER AS playtime
  FROM (
    SELECT id, streams, ms_played
    FROM artist_stats
    ORDER BY ms_played DESC
    LIMIT ${LIMIT}
  ) s
  JOIN artists a ON a.id = s.id
  ORDER BY playtime DESC
`;

export const TOP_TRACKS_SQL = `
  WITH filtered AS (
    SELECT
      i.track_id,
      i.ms_played
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    WHERE i.ts >= TIMESTAMP '${FROM}'
      AND i.ts < (DATE '${TO}' + INTERVAL 1 DAY)
      AND t.artists @> ARRAY[${ARTIST_ID}]
  ),
  track_stats AS (
    SELECT
      f.track_id,
      COUNT(*)::INTEGER AS streams,
      SUM(f.ms_played) AS ms_played
    FROM filtered f
    GROUP BY f.track_id
  ),
  top_tracks AS (
    SELECT track_id, streams, ms_played
    FROM track_stats
    ORDER BY ms_played DESC
    LIMIT ${LIMIT}
  ),
  top_meta AS (
    SELECT
      tt.track_id,
      tt.streams,
      tt.ms_played,
      t.title AS name,
      al.image
    FROM top_tracks tt
    JOIN tracks t ON t.id = tt.track_id
    LEFT JOIN albums al ON al.id = t.album_id
  ),
  descriptions AS (
    SELECT
      tm.track_id,
      string_agg(a.name, ', ' ORDER BY u.ordinality) AS description
    FROM top_meta tm
    JOIN tracks t ON t.id = tm.track_id
    CROSS JOIN unnest(t.artists) WITH ORDINALITY AS u(artist_id, ordinality)
    JOIN artists a ON a.id = u.artist_id
    GROUP BY tm.track_id
  )
  SELECT
    tm.track_id AS id,
    tm.name,
    d.description,
    tm.image,
    tm.streams,
    (tm.ms_played / 60000)::INTEGER AS playtime
  FROM top_meta tm
  LEFT JOIN descriptions d ON d.track_id = tm.track_id
  ORDER BY playtime DESC
`;

export const TOP_ALBUMS_SQL = `
  WITH filtered AS (
    SELECT
      i.track_id,
      i.ms_played
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    JOIN albums al ON al.id = t.album_id
    WHERE i.ts >= TIMESTAMP '${FROM}'
      AND i.ts < (DATE '${TO}' + INTERVAL 1 DAY)
      AND al.artists @> ARRAY[${ARTIST_ID}]
  ),
  track_stats AS (
    SELECT
      f.track_id,
      COUNT(*)::INTEGER AS streams,
      SUM(f.ms_played) AS ms_played
    FROM filtered f
    GROUP BY f.track_id
  ),
  album_stats AS (
    SELECT
      t.album_id AS id,
      SUM(ts.streams)::INTEGER AS streams,
      SUM(ts.ms_played) AS ms_played
    FROM track_stats ts
    JOIN tracks t ON t.id = ts.track_id
    WHERE t.album_id IS NOT NULL
    GROUP BY t.album_id
  ),
  top_albums AS (
    SELECT id, streams, ms_played
    FROM album_stats
    ORDER BY ms_played DESC
    LIMIT ${LIMIT}
  ),
  top_meta AS (
    SELECT
      ta.id,
      ta.streams,
      ta.ms_played,
      al.title AS name,
      al.image
    FROM top_albums ta
    JOIN albums al ON al.id = ta.id
  ),
  descriptions AS (
    SELECT
      tm.id AS album_id,
      string_agg(a.name, ', ' ORDER BY u.ordinality) AS description
    FROM top_meta tm
    JOIN albums al ON al.id = tm.id
    CROSS JOIN unnest(al.artists) WITH ORDINALITY AS u(artist_id, ordinality)
    JOIN artists a ON a.id = u.artist_id
    GROUP BY tm.id
  )
  SELECT
    tm.id,
    tm.name,
    d.description,
    tm.image,
    tm.streams,
    (tm.ms_played / 60000)::INTEGER AS playtime
  FROM top_meta tm
  LEFT JOIN descriptions d ON d.album_id = tm.id
  ORDER BY playtime DESC
`;

export const LISTENING_BY_DAY_SQL = `
  WITH date_range AS (
    SELECT generate_series::DATE AS date
    FROM generate_series(DATE '${FROM}', DATE '${TO}', INTERVAL 1 DAY)
  ),
  daily_stats AS (
    SELECT
      CAST(i.ts AS DATE) AS date,
      COUNT(*)::INTEGER AS streams,
      (SUM(i.ms_played) / 60000)::INTEGER AS playtime
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    WHERE i.ts >= TIMESTAMP '${FROM}'
      AND i.ts < (DATE '${TO}' + INTERVAL 1 DAY)
      AND t.artists @> ARRAY[${ARTIST_ID}]
    GROUP BY CAST(i.ts AS DATE)
  )
  SELECT
    d.date,
    COALESCE(s.streams, 0)::INTEGER AS streams,
    COALESCE(s.playtime, 0)::INTEGER AS playtime
  FROM date_range d
  LEFT JOIN daily_stats s ON s.date = d.date
  ORDER BY d.date
`;

export const UNIQUE_TRACKS_BY_MONTH_SQL = `
  WITH month_range AS (
    SELECT date_trunc('month', generate_series::DATE)::DATE AS month
    FROM generate_series(
      date_trunc('month', DATE '${FROM}')::DATE,
      date_trunc('month', DATE '${TO}')::DATE,
      INTERVAL 1 MONTH
    )
  ),
  monthly_stats AS (
    SELECT
      date_trunc('month', i.ts)::DATE AS month,
      COUNT(DISTINCT i.track_id)::INTEGER AS unique_tracks
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    WHERE i.ts >= TIMESTAMP '${FROM}'
      AND i.ts < (DATE '${TO}' + INTERVAL 1 DAY)
      AND t.artists @> ARRAY[${ARTIST_ID}]
    GROUP BY date_trunc('month', i.ts)
  )
  SELECT
    m.month,
    COALESCE(s.unique_tracks, 0)::INTEGER AS unique_tracks
  FROM month_range m
  LEFT JOIN monthly_stats s ON s.month = m.month
  ORDER BY m.month
`;

export const UNIQUE_TRACKS_V2_SQL = `
  WITH params AS (
    SELECT (DATE '${TO}' - DATE '${FROM}') < 31 AS by_day
  ),
  period_range AS (
    SELECT generate_series::DATE AS period
    FROM generate_series(DATE '${FROM}', DATE '${TO}', INTERVAL 1 DAY)
    WHERE (SELECT by_day FROM params)
    UNION ALL
    SELECT date_trunc('month', generate_series::DATE)::DATE AS period
    FROM generate_series(
      date_trunc('month', DATE '${FROM}')::DATE,
      date_trunc('month', DATE '${TO}')::DATE,
      INTERVAL 1 MONTH
    )
    WHERE NOT (SELECT by_day FROM params)
  ),
  filtered AS (
    SELECT
      i.ts,
      i.track_id
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    WHERE i.ts >= TIMESTAMP '${FROM}'
      AND i.ts < (DATE '${TO}' + INTERVAL 1 DAY)
      AND t.artists @> ARRAY[${ARTIST_ID}]
  ),
  stats AS (
    SELECT
      CASE
        WHEN p.by_day THEN CAST(f.ts AS DATE)
        ELSE date_trunc('month', f.ts)::DATE
      END AS period,
      COUNT(DISTINCT f.track_id)::INTEGER AS unique_tracks
    FROM filtered f
    CROSS JOIN params p
    GROUP BY 1
  )
  SELECT
    p.period,
    COALESCE(s.unique_tracks, 0)::INTEGER AS unique_tracks
  FROM period_range p
  LEFT JOIN stats s ON s.period = p.period
  ORDER BY p.period
`;

export const BENCHMARK_SQL = TOP_ARTISTS_SQL;
