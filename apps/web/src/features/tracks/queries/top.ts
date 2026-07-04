import { db } from "@harmony/duckdb";

import { Catalog } from "@/components/catalog/catalog";

export const topTracksFn = async ({ artistId }: { artistId?: number }) => {
  const whereClause = artistId ? `WHERE v.track_artist_ids @> ARRAY[${artistId}]` : "";
  return await db.query<Catalog>(`
    SELECT
      v.track_id AS id,
      ANY_VALUE(v.track_name) AS name,
      ANY_VALUE(v.track_artists_description) AS description,
      ANY_VALUE(v.image) AS image,
      COUNT(*)::INTEGER AS streams,
      SUM(i.ms_played) / 60000::INTEGER AS playtime
    FROM interactions i
    JOIN v_tracks_info v ON v.track_id = i.track_id
    ${whereClause}
    GROUP BY v.track_id
    ORDER BY playtime DESC
    LIMIT 50
  `);
};
