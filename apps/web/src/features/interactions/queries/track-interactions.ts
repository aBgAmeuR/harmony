import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

import type { Interaction } from "../types";

type TrackInteractionsParams = {
  trackId: number;
  from: Date;
  to: Date;
};

export const trackInteractionsFn = async ({ trackId, from, to }: TrackInteractionsParams) => {
  const conditions = [...interactionDateConditions(from, to), `i.track_id = ${trackId}`];

  return await db.query<Interaction>(`
    SELECT
      CAST(i.ts AS VARCHAR) AS timestamp,
      i.platform AS platform,
      i.ms_played AS "msPlayed",
      i.shuffle AS shuffle,
      i.skipped AS skipped,
      i.offline AS offline
    FROM interactions i
    ${joinWhere(conditions)}
    ORDER BY i.ts DESC
  `);
};
