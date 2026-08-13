import { db } from "@harmony/duckdb";

import type { ListeningSessions } from "../types";

import { buildListeningFilter, type ListeningRangeParams } from "./filter";

/** A new session starts after 30 minutes without a play. */
const SESSION_GAP_SECONDS = 30 * 60;

type SessionRow = {
  sessions: number | null;
  avg_min: number | null;
  longest_min: number | null;
  longest_start: string | null;
};

export const sessionsFn = async (params: ListeningRangeParams): Promise<ListeningSessions> => {
  const { artistJoin, where } = buildListeningFilter(params);

  const [row] = await db.query<SessionRow>(`
    WITH plays AS (
      SELECT i.ts, i.ms_played
      FROM interactions i
      ${artistJoin}
      ${where}
    ),
    ordered AS (
      SELECT
        ts,
        ms_played,
        LAG(ts) OVER (ORDER BY ts, ms_played) AS prev_ts
      FROM plays
    ),
    flagged AS (
      SELECT
        ts,
        ms_played,
        CASE
          WHEN prev_ts IS NULL OR date_diff('second', prev_ts, ts) > ${SESSION_GAP_SECONDS} THEN 1
          ELSE 0
        END AS new_session
      FROM ordered
    ),
    numbered AS (
      SELECT
        ts,
        ms_played,
        SUM(new_session) OVER (ORDER BY ts, ms_played ROWS UNBOUNDED PRECEDING) AS session_id
      FROM flagged
    ),
    sessions AS (
      SELECT
        MIN(ts) AS started,
        date_diff('millisecond', MIN(ts), MAX(ts)) + arg_max(ms_played, ts) AS duration_ms
      FROM numbered
      GROUP BY session_id
      HAVING COUNT(*) >= 2
    )
    SELECT
      COUNT(*)::INTEGER AS sessions,
      COALESCE(ROUND(AVG(duration_ms) / 60000.0, 1), 0)::DOUBLE AS avg_min,
      COALESCE(ROUND(MAX(duration_ms) / 60000.0, 1), 0)::DOUBLE AS longest_min,
      CAST((
        SELECT started FROM sessions ORDER BY duration_ms DESC, started ASC LIMIT 1
      ) AS VARCHAR) AS longest_start
    FROM sessions
  `);

  return {
    sessions: row?.sessions ?? 0,
    avgMinutes: row?.avg_min ?? 0,
    longestMinutes: row?.longest_min ?? 0,
    longestStart: row?.longest_start ?? null,
  };
};
