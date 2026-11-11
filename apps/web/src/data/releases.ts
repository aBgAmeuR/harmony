import { db } from "@harmony/duckdb";

import type { Range } from "@/shared/lib/date";

import { day, int } from "./sql";

export type Release = { album: string; releaseDate: string; image: string | null };

// Albums of the artist released in the range, oldest first.
export const releasesFn = async ({
  artistId,
  from,
  to,
}: Range & { artistId: number }): Promise<Release[]> =>
  await db.query<Release>(`
    SELECT al.title AS album, CAST(al.release_date AS VARCHAR) AS "releaseDate", al.image
    FROM albums al
    WHERE list_contains(al.artists, ${int(artistId)})
      AND al.release_date BETWEEN ${day(from)} AND ${day(to)}
    ORDER BY al.release_date
  `);
