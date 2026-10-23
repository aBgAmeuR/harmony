import { interactionDateConditions, joinWhere } from "@/data/sql/date-range";
import { buildPeriodRange } from "@/data/sql/period-range";

export type ListeningRangeParams = {
  artistId?: number;
  from: Date;
  to: Date;
};

export { calendarDaySpan } from "@/data/sql/period-range";

// The artist condition reads `t`, so a query that always joins tracks as `t` can use `conditions`
// without `artistJoin`.
export const buildListeningFilter = ({ artistId, from, to }: ListeningRangeParams) => {
  const artistJoin = artistId ? "JOIN tracks t ON t.id = i.track_id" : "";
  const conditions = [
    ...interactionDateConditions(from, to),
    ...(artistId ? [`t.artists @> ARRAY[${artistId}]`] : []),
  ];
  const where = joinWhere(conditions);

  const { byDay, fromSql, toSql, periodRange, periodExpr } = buildPeriodRange(from, to);

  return { artistJoin, conditions, where, byDay, fromSql, toSql, periodRange, periodExpr };
};
