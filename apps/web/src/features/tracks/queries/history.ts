import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

export type TrackHistoryMetrics = {
  longestStreakDays: number;
  longestStreakStart: string | null;
  firstPlayed: string | null;
  lastPlayed: string | null;
  firstPlayedOnRelease: boolean;
};

type TrackHistoryRow = {
  longest_streak_days: number | null;
  longest_streak_start: string | null;
  first_played: string | null;
  last_played: string | null;
  first_played_on_release: boolean | null;
};

type TrackHistoryParams = {
  trackId: number;
  from: Date;
  to: Date;
};

export const trackHistoryFn = async ({
  trackId,
  from,
  to,
}: TrackHistoryParams): Promise<TrackHistoryMetrics> => {
  const conditions = [...interactionDateConditions(from, to), `i.track_id = ${trackId}`];

  const [row] = await db.query<TrackHistoryRow>(`
    WITH play_days AS (
      SELECT DISTINCT CAST(i.ts AS DATE) AS play_date
      FROM interactions i
      ${joinWhere(conditions)}
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
        COUNT(*)::INTEGER AS streak_days
      FROM numbered
      GROUP BY streak_group
    ),
    best_streak AS (
      SELECT streak_days, streak_start
      FROM streaks
      ORDER BY streak_days DESC, streak_start ASC
      LIMIT 1
    ),
    bounds AS (
      SELECT
        MIN(i.ts) AS first_played,
        MAX(i.ts) AS last_played
      FROM interactions i
      ${joinWhere(conditions)}
    ),
    release AS (
      SELECT release_date
      FROM tracks
      WHERE id = ${trackId}
      LIMIT 1
    )
    SELECT
      COALESCE(bs.streak_days, 0)::INTEGER AS longest_streak_days,
      CAST(bs.streak_start AS VARCHAR) AS longest_streak_start,
      CAST(b.first_played AS VARCHAR) AS first_played,
      CAST(b.last_played AS VARCHAR) AS last_played,
      (
        b.first_played IS NOT NULL
        AND r.release_date IS NOT NULL
        AND CAST(b.first_played AS DATE) = r.release_date
      ) AS first_played_on_release
    FROM bounds b
    CROSS JOIN release r
    LEFT JOIN best_streak bs ON TRUE
  `);

  return {
    longestStreakDays: row?.longest_streak_days ?? 0,
    longestStreakStart: row?.longest_streak_start ?? null,
    firstPlayed: row?.first_played ?? null,
    lastPlayed: row?.last_played ?? null,
    firstPlayedOnRelease: row?.first_played_on_release ?? false,
  };
};
