import { db } from "@harmony/duckdb";

import type { TrackEngagementStage } from "./types";

import { buildListeningFilter, type ListeningRangeParams } from "./listening-filter";

type TrackEngagementRow = {
  unique_tracks: number;
  played_twice: number;
  played_5_times: number;
  played_20_times: number;
  played_50_plus: number;
};

const TRACK_ENGAGEMENT_STAGES = [
  { key: "unique_tracks", label: "Unique Tracks" },
  { key: "played_twice", label: "Played Twice" },
  { key: "played_5_times", label: "Played 5 Times" },
  { key: "played_20_times", label: "Played 20 Times" },
  { key: "played_50_plus", label: "Favorites (50+)" },
] as const;

export const trackEngagementFn = async (
  params: ListeningRangeParams,
): Promise<TrackEngagementStage[]> => {
  const { artistJoin, where } = buildListeningFilter(params);
  const [row] = await db.query<TrackEngagementRow>(`
    WITH play_counts AS (
      SELECT
        i.track_id,
        COUNT(*)::INTEGER AS plays
      FROM interactions i
      ${artistJoin}
      ${where}
      GROUP BY i.track_id
    )
    SELECT
      COUNT(*)::INTEGER AS unique_tracks,
      COUNT(*) FILTER (WHERE plays >= 2)::INTEGER AS played_twice,
      COUNT(*) FILTER (WHERE plays >= 5)::INTEGER AS played_5_times,
      COUNT(*) FILTER (WHERE plays >= 20)::INTEGER AS played_20_times,
      COUNT(*) FILTER (WHERE plays >= 50)::INTEGER AS played_50_plus
    FROM play_counts
  `);

  return TRACK_ENGAGEMENT_STAGES.map(({ key, label }) => ({
    label,
    value: row?.[key] ?? 0,
  }));
};
