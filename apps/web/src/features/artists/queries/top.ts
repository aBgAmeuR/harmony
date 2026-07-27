import { db } from "@harmony/duckdb";

import { Catalog } from "@/components/catalog/catalog";
import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

type TopArtistsParams = {
  from: Date;
  to: Date;
};

export const topArtistsFn = async ({ from, to }: TopArtistsParams) => {
  const conditions = interactionDateConditions(from, to);

  return await db.query<Catalog>(`
    WITH track_stats AS (
      SELECT
        i.track_id,
        COUNT(*)::INTEGER AS streams,
        SUM(i.ms_played) AS ms_played
      FROM interactions i
      ${joinWhere(conditions)}
      GROUP BY i.track_id
    )
    SELECT
      a.id AS id,
      ANY_VALUE(a.name) AS name,
      ANY_VALUE(a.image) AS image,
      SUM(ts.streams)::INTEGER AS streams,
      (SUM(ts.ms_played) / 60000)::INTEGER AS playtime
    FROM track_stats ts
    JOIN tracks t ON t.id = ts.track_id
    CROSS JOIN unnest(t.artists) AS u(artist_id)
    JOIN artists a ON a.id = u.artist_id
    GROUP BY a.id
    ORDER BY playtime DESC
    LIMIT 50
  `);
};
