import { db } from "@harmony/duckdb";

import type { ListeningStreak } from "../types";

import { buildListeningFilter, type ListeningRangeParams } from "./filter";

type StreakRow = {
  current_days: number | null;
  longest_days: number | null;
  longest_start: string | null;
  longest_end: string | null;
};

export const streakFn = async (params: ListeningRangeParams): Promise<ListeningStreak> => {
  const { artistJoin, where } = buildListeningFilter(params);

  const [row] = await db.query<StreakRow>(`
    WITH play_days AS (
      SELECT DISTINCT CAST(i.ts AS DATE) AS play_date
      FROM interactions i
      ${artistJoin}
      ${where}
    ),
    numbered AS (
      SELECT
        play_date,
        play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::INTEGER AS streak_group
      FROM play_days
    ),
    streaks AS (
      SELECT
        MIN(play_date) AS streak_start,
        MAX(play_date) AS streak_end,
        COUNT(*)::INTEGER AS streak_days
      FROM numbered
      GROUP BY streak_group
    ),
    bounds AS (
      SELECT MAX(play_date) AS last_day FROM play_days
    ),
    latest AS (
      SELECT streak_days
      FROM streaks, bounds
      WHERE streak_end = bounds.last_day
      LIMIT 1
    ),
    best AS (
      SELECT streak_days, streak_start, streak_end
      FROM streaks
      ORDER BY streak_days DESC, streak_start ASC
      LIMIT 1
    )
    SELECT
      COALESCE(latest.streak_days, 0)::INTEGER AS current_days,
      COALESCE(best.streak_days, 0)::INTEGER AS longest_days,
      CAST(best.streak_start AS VARCHAR) AS longest_start,
      CAST(best.streak_end AS VARCHAR) AS longest_end
    FROM (SELECT 1) AS dummy
    LEFT JOIN latest ON TRUE
    LEFT JOIN best ON TRUE
  `);

  return {
    currentDays: row?.current_days ?? 0,
    longestDays: row?.longest_days ?? 0,
    longestStart: row?.longest_start ?? null,
    longestEnd: row?.longest_end ?? null,
  };
};
