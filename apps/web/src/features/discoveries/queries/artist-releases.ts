import { db } from "@harmony/duckdb";

import type { Filter } from "@/lib/filter";

import { toSqlDate } from "@/lib/sql/date-range";

import type { ArtistRelease } from "../types";

export async function artistReleasesFn(filter: Filter): Promise<ArtistRelease[]> {
  const artistId = filter.artistId;
  if (artistId == null) return [];

  const from = toSqlDate(filter.from);
  const to = toSqlDate(filter.to);

  return db.query<ArtistRelease>(`
    SELECT
      al.title AS album,
      CAST(al.release_date AS VARCHAR) AS "releaseDate",
      strftime(date_trunc('week', al.release_date)::DATE, '%d %b %Y') AS "periodLabel",
      al.image AS image
    FROM albums al
    WHERE al.artists @> ARRAY[${artistId}]
      AND al.release_date IS NOT NULL
      AND al.release_date BETWEEN DATE '${from}' AND DATE '${to}'
    ORDER BY al.release_date
  `);
}
