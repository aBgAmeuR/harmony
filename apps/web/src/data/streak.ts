import { db } from "@harmony/duckdb";

import { playsFrom, type Filter } from "./filter";

export type Streak = {
  currentDays: number;
  longestDays: number;
  longestStart: string | null;
  longestEnd: string | null;
};

type StreakRow = {
  current_days: number;
  longest_days: number;
  longest_start: string | null;
  longest_end: string | null;
};

// Days in a row with at least one play. Ties go to the earliest streak.
export const streakFn = async (filter: Filter) => {
  const [row] = await db.query<StreakRow>(`
    WITH play_days AS (
      SELECT DISTINCT CAST(i.ts AS DATE) AS play_date
      ${playsFrom(filter)}
    ),
    streaks AS (
      SELECT MIN(play_date) AS streak_start, MAX(play_date) AS streak_end, COUNT(*)::INTEGER AS days
      FROM (
        SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::INTEGER AS streak
        FROM play_days
      )
      GROUP BY streak
    ),
    best AS (
      SELECT days, streak_start, streak_end FROM streaks
      ORDER BY days DESC, streak_start ASC
      LIMIT 1
    )
    SELECT
      COALESCE((
        SELECT days FROM streaks WHERE streak_end = (SELECT MAX(play_date) FROM play_days)
      ), 0)::INTEGER AS current_days,
      COALESCE(best.days, 0)::INTEGER AS longest_days,
      CAST(best.streak_start AS VARCHAR) AS longest_start,
      CAST(best.streak_end AS VARCHAR) AS longest_end
    FROM (SELECT 1) AS one
    LEFT JOIN best ON TRUE
  `);

  return {
    currentDays: row?.current_days ?? 0,
    longestDays: row?.longest_days ?? 0,
    longestStart: row?.longest_start ?? null,
    longestEnd: row?.longest_end ?? null,
  };
};
