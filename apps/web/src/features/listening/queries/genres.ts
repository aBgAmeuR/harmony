import { db } from "@harmony/duckdb";

import type { GenreSegment } from "../types";

type GenreRow = {
  genre: string;
  value: number;
  percentage: number;
};

function toGenreKey(label: string, index: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return slug || `genre_${index}`;
}

export const genresFn = async (): Promise<GenreSegment[]> => {
  const rows = await db.query<GenreRow>(`
    WITH genre_counts AS (
      SELECT
        g.genre,
        COUNT(*)::INTEGER AS value
      FROM interactions i
      INNER JOIN tracks t ON t.id = i.track_id
      INNER JOIN albums al ON al.id = t.album_id
      CROSS JOIN unnest(al.genres) AS g(genre)
      WHERE g.genre IS NOT NULL
        AND g.genre != ''
      GROUP BY g.genre
    ),
    totals AS (
      SELECT SUM(value)::DOUBLE AS total
      FROM genre_counts
    )
    SELECT
      genre,
      value,
      ROUND(100.0 * value / NULLIF(totals.total, 0))::INTEGER AS percentage
    FROM genre_counts
    CROSS JOIN totals
    ORDER BY value DESC
    LIMIT 5
  `);

  return rows.map((row, index) => ({
    key: toGenreKey(row.genre, index),
    label: row.genre,
    value: row.value,
    percentage: row.percentage,
  }));
};
