import { db } from "@harmony/duckdb";

import { joinWhere } from "@/data/sql/date-range";

import type { GenreSegment } from "./types";

import { buildListeningFilter, type ListeningRangeParams } from "./listening-filter";

type GenreRow = {
  genre: string;
  value: number;
  share: number;
};

const toGenreKey = (label: string, index: number): string => {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return slug || `genre_${index}`;
};

// The five most played album genres, with their share of the plays that have a genre.
export const genresFn = async (params: ListeningRangeParams): Promise<GenreSegment[]> => {
  const { conditions } = buildListeningFilter(params);
  const rows = await db.query<GenreRow>(`
    WITH genre_counts AS (
      SELECT
        g.genre,
        COUNT(*)::INTEGER AS value
      FROM interactions i
      INNER JOIN tracks t ON t.id = i.track_id
      INNER JOIN albums al ON al.id = t.album_id
      CROSS JOIN unnest(al.genres) AS g(genre)
      ${joinWhere([...conditions, "g.genre IS NOT NULL", "g.genre != ''"])}
      GROUP BY g.genre
    ),
    totals AS (
      SELECT SUM(value)::DOUBLE AS total
      FROM genre_counts
    )
    SELECT
      genre,
      value,
      COALESCE(value / NULLIF(totals.total, 0), 0)::DOUBLE AS share
    FROM genre_counts
    CROSS JOIN totals
    ORDER BY value DESC
    LIMIT 5
  `);

  return rows.map((row, index) => ({
    key: toGenreKey(row.genre, index),
    label: row.genre,
    value: row.value,
    share: row.share,
  }));
};
