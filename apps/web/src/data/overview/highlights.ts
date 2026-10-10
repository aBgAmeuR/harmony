import { db } from "@harmony/duckdb";

import { rankFn } from "@/data/rank";
import { streakFn } from "@/data/milestones/streak";
import { interactionDateConditions, joinWhere, toSqlDate } from "@/data/sql/date-range";

import type { Range } from "./range";

export type Highlights = {
  peakDay: { date: string; minutes: number; streams: number } | null;
  streak: { days: number; start: string | null; end: string | null };
  // null when the range starts with the package, where every artist would count as new
  newArtists: number | null;
  replayed: {
    name: string;
    description: string | null;
    image: string | null;
    streams: number;
  } | null;
};

type PeakRow = { date: string; minutes: number; streams: number };

export const highlightsFn = async (range: Range): Promise<Highlights> => {
  const { from, to } = range;
  const fromSql = toSqlDate(from);
  const toSql = toSqlDate(to);

  const [peak, streak, fresh, replayed] = await Promise.all([
    db.query<PeakRow>(`
      SELECT
        CAST(i.ts AS DATE)::VARCHAR AS date,
        (SUM(i.ms_played) / 60000.0)::DOUBLE AS minutes,
        COUNT(*)::INTEGER AS streams
      FROM interactions i
      ${joinWhere(interactionDateConditions(from, to))}
      GROUP BY CAST(i.ts AS DATE)
      ORDER BY minutes DESC
      LIMIT 1
    `),
    streakFn({ from, to }),
    db.query<{ value: number | null }>(`
      WITH firsts AS (
        SELECT MIN(CAST(i.ts AS DATE)) AS first_day
        FROM interactions i
        JOIN tracks t ON t.id = i.track_id
        CROSS JOIN unnest(t.artists) AS u(artist_id)
        GROUP BY u.artist_id
      )
      SELECT
        CASE
          WHEN (SELECT MIN(CAST(ts AS DATE)) FROM interactions) >= DATE '${fromSql}' THEN NULL
          ELSE COUNT(*) FILTER (WHERE first_day BETWEEN DATE '${fromSql}' AND DATE '${toSql}')
        END::INTEGER AS value
      FROM firsts
    `),
    rankFn({ by: "track", scope: range, sort: "streams", limit: 1 }),
  ]);

  const top = replayed[0];

  return {
    peakDay: peak[0] ?? null,
    streak: { days: streak.longestDays, start: streak.longestStart, end: streak.longestEnd },
    newArtists: fresh[0]?.value ?? null,
    replayed: top
      ? { name: top.name, description: top.description, image: top.image, streams: top.streams }
      : null,
  };
};
