import { db } from "@harmony/duckdb";

import { joinWhere } from "@/data/sql/date-range";

import type { ReleaseYearPoint } from "./types";

import { buildListeningFilter, type ListeningRangeParams } from "./listening-filter";

// Streams by the release year of their album, with the most played album of each year. Some
// catalog dates are placeholders such as year 10, so years before 1900 are left out.
export const releaseYearFn = async (params: ListeningRangeParams): Promise<ReleaseYearPoint[]> => {
  const { conditions } = buildListeningFilter(params);
  return await db.query<ReleaseYearPoint>(`
    WITH plays AS (
      SELECT
        EXTRACT(YEAR FROM al.release_date)::INTEGER AS year,
        al.title AS album,
        COUNT(*)::INTEGER AS value
      FROM interactions i
      INNER JOIN tracks t ON t.id = i.track_id
      INNER JOIN albums al ON al.id = t.album_id
      ${joinWhere([...conditions, "al.release_date >= DATE '1900-01-01'"])}
      GROUP BY 1, al.id, al.title
    )
    SELECT
      year::VARCHAR AS name,
      SUM(value)::INTEGER AS value,
      arg_max(album, value) AS album
    FROM plays
    GROUP BY year
    ORDER BY year
  `);
};
