import { db } from "@harmony/duckdb";

import type { RankBy } from "@/data/rank";

import { interactionDateConditions, joinWhere } from "@/data/sql/date-range";
import { buildPeriodRange } from "@/data/sql/period-range";

import { UNKNOWN_ID } from "./list";

export type ExplorerTrendPoint = {
  date: Date;
  playtime: number;
  streams: number;
};

export type ExplorerTrends = Record<number, ExplorerTrendPoint[]>;

type TrendRow = {
  id: number;
  period: string | Date;
  playtime: number;
  streams: number;
};

type TrendsArgs = {
  by: RankBy;
  ids: number[];
  from: Date;
  to: Date;
};

// Interactions joined to the entity they count for, one row per interaction and entity.
const sources = {
  track: {
    join: "",
    key: "i.track_id",
  },
  album: {
    join: "JOIN tracks t ON t.id = i.track_id",
    key: `COALESCE(t.album_id, ${UNKNOWN_ID})`,
  },
  artist: {
    join: "JOIN tracks t ON t.id = i.track_id CROSS JOIN unnest(t.artists) AS u(artist_id)",
    key: "u.artist_id",
  },
} as const;

export const explorerTrendsFn = async ({
  by,
  ids,
  from,
  to,
}: TrendsArgs): Promise<ExplorerTrends> => {
  if (ids.length === 0) return {};

  const { periodRange, periodExpr } = buildPeriodRange(from, to);
  const list = ids.map((id) => Math.trunc(id)).join(", ");
  const { join, key } = sources[by];

  const rows = await db.query<TrendRow>(`
    WITH period_range AS (
      ${periodRange}
    ),
    entity_ids AS (
      SELECT UNNEST([${list}])::DOUBLE AS id
    ),
    stats AS (
      SELECT
        ${key}::DOUBLE AS id,
        ${periodExpr} AS period,
        ROUND(SUM(i.ms_played) / 60000.0)::INTEGER AS playtime,
        COUNT(*)::INTEGER AS streams
      FROM interactions i
      ${join}
      ${joinWhere([...interactionDateConditions(from, to), `${key} IN (${list})`])}
      GROUP BY 1, 2
    )
    SELECT
      e.id,
      p.period,
      COALESCE(s.playtime, 0)::INTEGER AS playtime,
      COALESCE(s.streams, 0)::INTEGER AS streams
    FROM entity_ids e
    CROSS JOIN period_range p
    LEFT JOIN stats s ON s.id = e.id AND s.period = p.period
    ORDER BY e.id, p.period
  `);

  const trends: ExplorerTrends = {};
  for (const id of ids) trends[id] = [];

  for (const row of rows) {
    trends[row.id]?.push({
      date: row.period instanceof Date ? row.period : new Date(row.period),
      playtime: row.playtime,
      streams: row.streams,
    });
  }

  return trends;
};
