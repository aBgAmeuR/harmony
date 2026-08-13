import { db } from "@harmony/duckdb";

import { ARTIST_RUNGS, HOUR_RUNGS, STREAM_RUNGS, TRACK_RUNGS, type NextMilestone } from "../types";
import { buildListeningFilter, tracksJoin, type ListeningRangeParams } from "./filter";

type TotalsRow = {
  hours: number | null;
  streams: number | null;
  tracks: number | null;
  artists: number | null;
};

function nextRung(
  current: number,
  ladder: readonly number[],
): { target: number; remaining: number; reached: boolean } {
  const target = ladder.find((rung) => current < rung);
  if (target === undefined) {
    const last = ladder[ladder.length - 1] ?? current;
    return { target: last, remaining: 0, reached: true };
  }
  return { target, remaining: target - current, reached: false };
}

function barPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function toBar(
  id: NextMilestone["id"],
  label: string,
  current: number,
  ladder: readonly number[],
): NextMilestone {
  const { target, remaining, reached } = nextRung(current, ladder);
  return {
    id,
    label,
    current,
    target,
    remaining,
    percent: barPercent(current, target),
    reached,
  };
}

export const nextMilestonesFn = async (params: ListeningRangeParams): Promise<NextMilestone[]> => {
  const { artistJoin, where } = buildListeningFilter(params);
  const join = tracksJoin(params);

  const [row] = await db.query<TotalsRow>(`
    WITH totals AS (
      SELECT
        COALESCE(ROUND(SUM(i.ms_played) / 3600000.0, 1), 0)::DOUBLE AS hours,
        COUNT(*)::INTEGER AS streams,
        COUNT(DISTINCT i.track_id)::INTEGER AS tracks
      FROM interactions i
      ${artistJoin}
      ${where}
    ),
    artist_totals AS (
      SELECT COUNT(DISTINCT u.artist_id)::INTEGER AS artists
      FROM interactions i
      ${join}
      CROSS JOIN unnest(t.artists) AS u(artist_id)
      ${where}
    )
    SELECT
      totals.hours,
      totals.streams,
      totals.tracks,
      artist_totals.artists
    FROM totals, artist_totals
  `);

  return [
    toBar("hours", "Hours", row?.hours ?? 0, HOUR_RUNGS),
    toBar("streams", "Streams", row?.streams ?? 0, STREAM_RUNGS),
    toBar("artists", "Unique artists", row?.artists ?? 0, ARTIST_RUNGS),
    toBar("tracks", "Unique tracks", row?.tracks ?? 0, TRACK_RUNGS),
  ];
};
