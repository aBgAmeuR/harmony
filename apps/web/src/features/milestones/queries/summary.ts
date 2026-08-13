import { db } from "@harmony/duckdb";

import type { MilestoneSummary } from "../types";

import { buildListeningFilter, type ListeningRangeParams } from "./filter";

type SummaryRow = {
  listening_days: number | null;
  streams: number | null;
  range_start: string | null;
  first_track: string | null;
  first_artists: string | null;
};

export const summaryFn = async (params: ListeningRangeParams): Promise<MilestoneSummary> => {
  const { artistJoin, where } = buildListeningFilter(params);

  const [row] = await db.query<SummaryRow>(`
    WITH stats AS (
      SELECT
        COUNT(DISTINCT CAST(i.ts AS DATE))::INTEGER AS listening_days,
        COUNT(*)::INTEGER AS streams,
        MIN(i.ts) AS first_ts
      FROM interactions i
      ${artistJoin}
      ${where}
    ),
    first_play AS (
      SELECT v.track_name, v.track_artists_description
      FROM interactions i
      ${artistJoin}
      JOIN v_tracks_info v ON v.track_id = i.track_id
      ${where}
      ORDER BY i.ts, i.track_id
      LIMIT 1
    )
    SELECT
      COALESCE(stats.listening_days, 0)::INTEGER AS listening_days,
      COALESCE(stats.streams, 0)::INTEGER AS streams,
      CAST(stats.first_ts AS VARCHAR) AS range_start,
      first_play.track_name AS first_track,
      first_play.track_artists_description AS first_artists
    FROM stats
    LEFT JOIN first_play ON TRUE
  `);

  return {
    listeningDays: row?.listening_days ?? 0,
    streams: row?.streams ?? 0,
    rangeStart: row?.range_start ?? null,
    firstTrack: row?.first_track ?? null,
    firstArtists: row?.first_artists ?? null,
  };
};
