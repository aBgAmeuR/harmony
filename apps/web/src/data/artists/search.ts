import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/data/sql/date-range";
import { escapeLike } from "@/data/sql/escape";

export type ArtistOption = {
  id: number;
  name: string;
  image: string | null;
  // Minutes listened in the period.
  playtime: number;
};

type SearchArgs = {
  query?: string;
  from: Date;
  to: Date;
};

// Artists matching the query, or the most listened to in the period when there is none.
export const searchArtistsFn = async ({ query, from, to }: SearchArgs): Promise<ArtistOption[]> => {
  const term = query?.trim() ?? "";
  const like = `'%${escapeLike(term)}%' ESCAPE '\\'`;

  return await db.query<ArtistOption>(`
    WITH track_stats AS (
      SELECT i.track_id, SUM(i.ms_played) AS ms_played
      FROM interactions i
      ${joinWhere(interactionDateConditions(from, to))}
      GROUP BY i.track_id
    ),
    artist_stats AS (
      SELECT u.artist_id AS id, SUM(ts.ms_played) AS ms_played
      FROM track_stats ts
      JOIN tracks t ON t.id = ts.track_id
      CROSS JOIN unnest(t.artists) AS u(artist_id)
      GROUP BY u.artist_id
    )
    SELECT
      a.id AS id,
      a.name AS name,
      a.image AS image,
      ROUND(COALESCE(s.ms_played, 0) / 60000.0)::INTEGER AS playtime
    FROM artists a
    LEFT JOIN artist_stats s ON s.id = a.id
    ${term === "" ? "WHERE s.ms_played > 0" : `WHERE a.name ILIKE ${like}`}
    ORDER BY ${term === "" ? "" : `(a.name ILIKE '${escapeLike(term)}%' ESCAPE '\\') DESC,`}
      s.ms_played DESC NULLS LAST,
      a.name ASC
    LIMIT 25
  `);
};
