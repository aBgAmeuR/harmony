import { db } from "@harmony/duckdb";

import type { ReleaseYearPoint } from "../types";

export const releaseYearFn = async (): Promise<ReleaseYearPoint[]> => {
  return await db.query<ReleaseYearPoint>(`
    SELECT
      EXTRACT(YEAR FROM al.release_date)::VARCHAR AS name,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    INNER JOIN tracks t ON t.id = i.track_id
    INNER JOIN albums al ON al.id = t.album_id
    WHERE al.release_date IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM al.release_date)
    ORDER BY EXTRACT(YEAR FROM al.release_date)
  `);
};
