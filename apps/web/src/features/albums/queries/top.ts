import { db } from "@harmony/duckdb";

import { Catalog } from "@/components/catalog/catalog";
import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

type TopAlbumsParams = {
  artistId?: number;
  from: Date;
  to: Date;
};

export const topAlbumsFn = async ({ artistId, from, to }: TopAlbumsParams) => {
  const conditions = [
    ...interactionDateConditions(from, to),
    ...(artistId ? [`v.album_artist_ids @> ARRAY[${artistId}]`] : []),
  ];

  return await db.query<Catalog>(`
    SELECT
      v.album_id AS id,
      ANY_VALUE(v.album_title) AS name,
      ANY_VALUE(v.album_artists_description) AS description,
      ANY_VALUE(v.image) AS image,
      COUNT(*)::INTEGER AS streams,
      SUM(i.ms_played) / 60000::INTEGER AS playtime
    FROM interactions i
    JOIN v_tracks_info v ON v.track_id = i.track_id
    ${joinWhere(conditions)}
    GROUP BY v.album_id
    ORDER BY playtime DESC
    LIMIT 50
  `);
};
