import { db } from "@harmony/duckdb";

import type { Range } from "@/shared/lib/date";

import { day, int } from "./sql";

export type Release = { album: string; releaseDate: string; image: string | null };

export const releasesFn = async ({ artistId, from, to }: Range & { artistId: number }) =>
  await db.query<Release>(`
    SELECT al.title AS album, CAST(al.release_date AS VARCHAR) AS "releaseDate", al.image
    FROM albums al
    WHERE list_contains(al.artists, ${int(artistId)})
      AND al.release_date BETWEEN ${day(from)} AND ${day(to)}
    ORDER BY al.release_date
  `);
