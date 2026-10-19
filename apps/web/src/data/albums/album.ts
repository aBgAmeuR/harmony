import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/data/sql/date-range";

export type AlbumInfo = {
  id: number;
  name: string;
  image: string | null;
  type: string | null;
  releaseDate: string | null;
  trackCount: number;
  artists: { id: number; name: string }[];
};

type AlbumRow = {
  id: number;
  name: string;
  image: string | null;
  type: string | null;
  release_date: string | null;
  track_count: number;
  artist_id: number | null;
  artist_name: string | null;
};

export const getAlbumFn = async (albumId: number): Promise<AlbumInfo | null> => {
  const rows = await db.query<AlbumRow>(`
    SELECT
      al.id AS id,
      al.title AS name,
      COALESCE(NULLIF(al.image_uri, ''), al.image) AS image,
      al.album_type AS type,
      CAST(al.release_date AS VARCHAR) AS release_date,
      GREATEST(
        COALESCE(al.nb_tracks, 0),
        (SELECT COUNT(*) FROM tracks t WHERE t.album_id = al.id)
      )::INTEGER AS track_count,
      a.id AS artist_id,
      a.name AS artist_name
    FROM albums al
    LEFT JOIN unnest(al.artists) WITH ORDINALITY AS u(artist_id, position) ON TRUE
    LEFT JOIN artists a ON a.id = u.artist_id
    WHERE al.id = ${Math.trunc(albumId)}
    ORDER BY u.position
  `);

  const [first] = rows;
  if (!first) return null;

  return {
    id: first.id,
    name: first.name,
    image: first.image,
    type: first.type,
    releaseDate: first.release_date,
    trackCount: first.track_count,
    artists: rows.flatMap((row) =>
      row.artist_id !== null && row.artist_name !== null
        ? [{ id: row.artist_id, name: row.artist_name }]
        : [],
    ),
  };
};

export type AlbumTrack = {
  id: number;
  name: string;
  description: string | null;
  streams: number;
  playtime: number;
};

type AlbumRange = {
  albumId: number;
  from: Date;
  to: Date;
};

// Every track of the album known to the package, played in the period or not.
export const albumTracksFn = async ({ albumId, from, to }: AlbumRange): Promise<AlbumTrack[]> =>
  await db.query<AlbumTrack>(`
    SELECT
      v.track_id AS id,
      v.track_name AS name,
      v.track_artists_description AS description,
      COALESCE(s.streams, 0)::INTEGER AS streams,
      COALESCE(s.playtime, 0)::INTEGER AS playtime
    FROM v_tracks_info v
    JOIN tracks t ON t.id = v.track_id
    LEFT JOIN (
      SELECT
        i.track_id,
        COUNT(*)::INTEGER AS streams,
        ROUND(SUM(i.ms_played) / 60000.0)::INTEGER AS playtime
      FROM interactions i
      ${joinWhere(interactionDateConditions(from, to))}
      GROUP BY i.track_id
    ) s ON s.track_id = v.track_id
    WHERE v.album_id = ${Math.trunc(albumId)}
    ORDER BY t.disk_number NULLS LAST, t.track_position NULLS LAST, v.track_name
  `);

export type AlbumKpis = {
  playtime: number;
  streams: number;
  tracksPlayed: number;
  // Fraction between 0 and 1.
  skipRate: number;
};

type AlbumKpisRow = {
  playtime: number | null;
  streams: number;
  tracks_played: number;
  skip_rate: number | null;
};

export const albumKpisFn = async ({ albumId, from, to }: AlbumRange): Promise<AlbumKpis> => {
  const conditions = [
    ...interactionDateConditions(from, to),
    `v.album_id = ${Math.trunc(albumId)}`,
  ];

  const [row] = await db.query<AlbumKpisRow>(`
    SELECT
      ROUND(SUM(i.ms_played) / 60000.0)::INTEGER AS playtime,
      COUNT(*)::INTEGER AS streams,
      COUNT(DISTINCT i.track_id)::INTEGER AS tracks_played,
      (COUNT(*) FILTER (WHERE i.skipped) / NULLIF(COUNT(*), 0))::DOUBLE AS skip_rate
    FROM interactions i
    JOIN v_tracks_info v ON v.track_id = i.track_id
    ${joinWhere(conditions)}
  `);

  return {
    playtime: row?.playtime ?? 0,
    streams: row?.streams ?? 0,
    tracksPlayed: row?.tracks_played ?? 0,
    skipRate: row?.skip_rate ?? 0,
  };
};
