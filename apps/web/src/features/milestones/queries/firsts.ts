import { db } from "@harmony/duckdb";

import type { Discovery } from "../types";

import { buildListeningFilter, tracksJoin, type ListeningRangeParams } from "./filter";

type FirstRow = {
  id: number;
  date: string | null;
  name: string | null;
  image: string | null;
  later_rank: number;
};

export const firstsFn = async (params: ListeningRangeParams): Promise<Discovery[]> => {
  const { where } = buildListeningFilter(params);
  const join = tracksJoin(params);

  const rows = await db.query<FirstRow>(`
    WITH artist_stats AS (
      SELECT
        u.artist_id,
        MIN(i.ts) AS first_ts,
        SUM(i.ms_played) AS ms
      FROM interactions i
      ${join}
      CROSS JOIN unnest(t.artists) AS u(artist_id)
      ${where}
      GROUP BY u.artist_id
    ),
    ranked AS (
      SELECT
        artist_id,
        first_ts,
        ms,
        ROW_NUMBER() OVER (ORDER BY ms DESC, artist_id ASC)::INTEGER AS later_rank
      FROM artist_stats
    )
    SELECT
      a.id AS id,
      CAST(CAST(r.first_ts AS DATE) AS VARCHAR) AS date,
      a.name AS name,
      a.image AS image,
      r.later_rank AS later_rank
    FROM ranked r
    JOIN artists a ON a.id = r.artist_id
    WHERE r.later_rank <= 50
      AND r.ms >= 1800000
    ORDER BY r.first_ts ASC
    LIMIT 12
  `);

  return rows.flatMap((row) => {
    if (!row.name || !row.date) return [];
    return [
      {
        id: row.id,
        date: row.date,
        name: row.name,
        image: row.image,
        laterRank: row.later_rank,
      },
    ];
  });
};
