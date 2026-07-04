import { db } from "@harmony/duckdb";

import { Catalog } from "@/components/catalog/catalog";

export const topArtistsFn = async ({ size }: { size: number }) => {
  return await db.query<Catalog>(`
    SELECT
      a.id AS id,
      ANY_VALUE(a.name) AS name,
      ANY_VALUE(a.image) AS image,
      COUNT(*)::INTEGER AS streams,
      SUM(i.ms_played) / 60000::INTEGER AS playtime
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    CROSS JOIN unnest(t.artists) AS u(artist_id)
    JOIN artists a ON a.id = u.artist_id
    GROUP BY a.id
    ORDER BY playtime DESC
    LIMIT ${size}
  `);
};
