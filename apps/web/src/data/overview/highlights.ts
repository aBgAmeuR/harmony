import { db } from "@harmony/duckdb";

import { streakFn } from "@/data/milestones/streak";
import { rankFn } from "@/data/rank";
import { interactionDateConditions, joinWhere, toSqlDate } from "@/data/sql/date-range";

import type { Range } from "./range";

export type Highlights = {
  peakDay: { date: string; minutes: number; streams: number } | null;
  // Minutes of every day in the month of the peak day, days without plays included.
  peakMonth: { date: string; minutes: number }[];
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
  const day = peak[0]?.date;
  const peakMonth = day
    ? await db.query<{ date: string; minutes: number }>(`
        WITH days AS (
          SELECT generate_series::DATE AS d
          FROM generate_series(
            date_trunc('month', DATE '${day}')::DATE,
            (date_trunc('month', DATE '${day}') + INTERVAL 1 MONTH - INTERVAL 1 DAY)::DATE,
            INTERVAL 1 DAY
          )
        ),
        played AS (
          SELECT CAST(i.ts AS DATE) AS d, SUM(i.ms_played) / 60000.0 AS minutes
          FROM interactions i
          WHERE date_trunc('month', i.ts) = date_trunc('month', DATE '${day}')
          GROUP BY 1
        )
        SELECT days.d::VARCHAR AS date, COALESCE(played.minutes, 0)::DOUBLE AS minutes
        FROM days
        LEFT JOIN played ON played.d = days.d
        ORDER BY days.d
      `)
    : [];

  return {
    peakDay: peak[0] ?? null,
    peakMonth,
    streak: { days: streak.longestDays, start: streak.longestStart, end: streak.longestEnd },
    newArtists: fresh[0]?.value ?? null,
    replayed: top
      ? { name: top.name, description: top.description, image: top.image, streams: top.streams }
      : null,
  };
};
