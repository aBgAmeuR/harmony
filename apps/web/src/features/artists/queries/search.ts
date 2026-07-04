import { db } from "@harmony/duckdb";

import { Catalog } from "@/components/catalog/catalog";

export const searchArtistsFn = async ({ query }: { query?: string }) => {
  if (!query || query === "") {
    return await db.query<Pick<Catalog, "id" | "name" | "image">>(`
      SELECT
        a.id AS id,
        ANY_VALUE(a.name) AS name,
        ANY_VALUE(a.picture) AS image,
        COUNT(*)::INTEGER AS streams
      FROM interactions i
      JOIN tracks t ON t.id = i.track_id
      CROSS JOIN unnest(t.artists) AS u(artist_id)
      JOIN artists a ON a.id = u.artist_id
      GROUP BY a.id, a.name, a.picture
      ORDER BY streams DESC, a.name ASC
      LIMIT 25
    `);
  }

  return await db.query<Pick<Catalog, "id" | "name" | "image">>(`
    SELECT
      a.id AS id,
      a.name AS name,
      a.picture AS image,
    FROM artists a
    WHERE a.name ILIKE '%${query}%'
    ORDER BY a.name ASC
    LIMIT 25
  `);
};
