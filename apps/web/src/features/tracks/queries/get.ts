import { db } from "@harmony/duckdb";

export type TrackDetails = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
};

export const getTrackFn = async (trackId: number): Promise<TrackDetails | null> => {
  const [row] = await db.query<TrackDetails>(`
    SELECT
      track_id AS id,
      track_name AS name,
      track_artists_description AS description,
      COALESCE(NULLIF(image_uri, ''), image) AS image
    FROM v_tracks_info
    WHERE track_id = ${trackId}
    LIMIT 1
  `);

  return row ?? null;
};
