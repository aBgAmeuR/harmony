import { db } from "@harmony/duckdb";

import { Catalog } from "@/components/catalog/catalog";

type ArtistRow = Pick<Catalog, "id" | "name" | "image">;

function escapeSqlLiteral(value: string): string {
  return value.replaceAll("'", "''");
}

export const searchArtistsFn = async ({ query }: { query?: string }): Promise<ArtistRow[]> => {
  const trimmed = query?.trim() ?? "";

  if (trimmed === "") {
    return await db.query<ArtistRow>(`
      WITH track_stats AS (
        SELECT
          i.track_id,
          SUM(i.ms_played) AS ms_played
        FROM interactions i
        GROUP BY i.track_id
      )
      SELECT
        a.id AS id,
        ANY_VALUE(a.name) AS name,
        ANY_VALUE(a.image) AS image
      FROM track_stats ts
      JOIN tracks t ON t.id = ts.track_id
      CROSS JOIN unnest(t.artists) AS u(artist_id)
      JOIN artists a ON a.id = u.artist_id
      GROUP BY a.id
      ORDER BY SUM(ts.ms_played) DESC, ANY_VALUE(a.name) ASC
      LIMIT 25
    `);
  }

  const escaped = escapeSqlLiteral(trimmed);

  return await db.query<ArtistRow>(`
    SELECT
      a.id AS id,
      a.name AS name,
      a.image AS image
    FROM artists a
    WHERE a.name ILIKE '%${escaped}%'
    ORDER BY
      (a.name ILIKE '${escaped}%') DESC,
      a.name ASC
    LIMIT 25
  `);
};
