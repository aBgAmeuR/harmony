import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere, toSqlDate } from "@/data/sql/date-range";

export type ArtistInfo = {
  id: number;
  name: string;
  image: string | null;
};

export const getArtistFn = async (artistId: number): Promise<ArtistInfo | null> => {
  const [row] = await db.query<ArtistInfo>(`
    SELECT
      id,
      name,
      COALESCE(NULLIF(image_uri, ''), image) AS image
    FROM artists
    WHERE id = ${Math.trunc(artistId)}
    LIMIT 1
  `);

  return row ?? null;
};

export type ArtistKpis = {
  playtime: number;
  streams: number;
  tracks: number;
  // Fraction between 0 and 1.
  skipRate: number;
};

type ArtistKpisRow = {
  playtime: number | null;
  streams: number;
  tracks: number;
  skip_rate: number | null;
};

type ArtistRange = {
  artistId: number;
  from: Date;
  to: Date;
};

export const artistKpisFn = async ({ artistId, from, to }: ArtistRange): Promise<ArtistKpis> => {
  const conditions = [
    ...interactionDateConditions(from, to),
    `v.track_artist_ids @> ARRAY[${Math.trunc(artistId)}]`,
  ];

  const [row] = await db.query<ArtistKpisRow>(`
    SELECT
      ROUND(SUM(i.ms_played) / 60000.0)::INTEGER AS playtime,
      COUNT(*)::INTEGER AS streams,
      COUNT(DISTINCT i.track_id)::INTEGER AS tracks,
      (COUNT(*) FILTER (WHERE i.skipped) / NULLIF(COUNT(*), 0))::DOUBLE AS skip_rate
    FROM interactions i
    JOIN v_tracks_info v ON v.track_id = i.track_id
    ${joinWhere(conditions)}
  `);

  return {
    playtime: row?.playtime ?? 0,
    streams: row?.streams ?? 0,
    tracks: row?.tracks ?? 0,
    skipRate: row?.skip_rate ?? 0,
  };
};

export type ArtistMonth = {
  // First day of the month, as an ISO date.
  month: string;
  playtime: number;
  streams: number;
};

type ArtistMonthRow = {
  month: string;
  playtime: number;
  streams: number;
};

// Listening of the artist for every month between `from` and `to`, empty months included.
export const artistMonthlyFn = async ({
  artistId,
  from,
  to,
}: ArtistRange): Promise<ArtistMonth[]> => {
  const conditions = [
    ...interactionDateConditions(from, to),
    `v.track_artist_ids @> ARRAY[${Math.trunc(artistId)}]`,
  ];

  return await db.query<ArtistMonthRow>(`
    WITH months AS (
      SELECT date_trunc('month', generate_series::DATE)::DATE AS month
      FROM generate_series(
        date_trunc('month', DATE '${toSqlDate(from)}')::DATE,
        date_trunc('month', DATE '${toSqlDate(to)}')::DATE,
        INTERVAL 1 MONTH
      )
    ),
    stats AS (
      SELECT
        date_trunc('month', i.ts)::DATE AS month,
        ROUND(SUM(i.ms_played) / 60000.0)::INTEGER AS playtime,
        COUNT(*)::INTEGER AS streams
      FROM interactions i
      JOIN v_tracks_info v ON v.track_id = i.track_id
      ${joinWhere(conditions)}
      GROUP BY 1
    )
    SELECT
      CAST(m.month AS VARCHAR) AS month,
      COALESCE(s.playtime, 0)::INTEGER AS playtime,
      COALESCE(s.streams, 0)::INTEGER AS streams
    FROM months m
    LEFT JOIN stats s ON s.month = m.month
    ORDER BY m.month
  `);
};
