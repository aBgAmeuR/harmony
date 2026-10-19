import { db } from "@harmony/duckdb";

export type TrackDetails = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  albumId: number | null;
  albumName: string | null;
  artists: { id: number; name: string }[];
};

type TrackRow = Omit<TrackDetails, "albumId" | "albumName" | "artists"> & {
  album_id: number | null;
  album_name: string | null;
  artist_id: number | null;
  artist_name: string | null;
};

export const getTrackFn = async (trackId: number): Promise<TrackDetails | null> => {
  const rows = await db.query<TrackRow>(`
    SELECT
      v.track_id AS id,
      v.track_name AS name,
      v.track_artists_description AS description,
      COALESCE(NULLIF(v.image_uri, ''), v.image) AS image,
      v.album_id AS album_id,
      v.album_title AS album_name,
      a.id AS artist_id,
      a.name AS artist_name
    FROM v_tracks_info v
    LEFT JOIN unnest(v.track_artist_ids) WITH ORDINALITY AS u(artist_id, position) ON TRUE
    LEFT JOIN artists a ON a.id = u.artist_id
    WHERE v.track_id = ${Math.trunc(trackId)}
    ORDER BY u.position
  `);

  const [first] = rows;
  if (!first) return null;

  return {
    id: first.id,
    name: first.name,
    description: first.description,
    image: first.image,
    albumId: first.album_id,
    albumName: first.album_name,
    artists: rows.flatMap((row) =>
      row.artist_id !== null && row.artist_name !== null
        ? [{ id: row.artist_id, name: row.artist_name }]
        : [],
    ),
  };
};
