import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";
import { buildPeriodRange } from "@/lib/sql/period-range";

export type ListeningRangeParams = {
  artistId?: number;
  from: Date;
  to: Date;
};

export { calendarDaySpan } from "@/lib/sql/period-range";

export function buildListeningFilter({ artistId, from, to }: ListeningRangeParams) {
  const artistJoin = artistId ? "JOIN tracks t ON t.id = i.track_id" : "";
  const where = joinWhere([
    ...interactionDateConditions(from, to),
    ...(artistId ? [`t.artists @> ARRAY[${artistId}]`] : []),
  ]);

  const { byDay, fromSql, toSql, periodRange, periodExpr } = buildPeriodRange(from, to);

  return { artistJoin, where, byDay, fromSql, toSql, periodRange, periodExpr };
}
