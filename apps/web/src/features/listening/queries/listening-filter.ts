import { interactionDateConditions, joinWhere, toSqlDate } from "@/lib/sql/date-range";

export type ListeningRangeParams = {
  artistId?: number;
  from: Date;
  to: Date;
};

export function calendarDaySpan(from: Date, to: Date): number {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return (toUtc - fromUtc) / 86_400_000;
}

export function buildListeningFilter({ artistId, from, to }: ListeningRangeParams) {
  const fromSql = toSqlDate(from);
  const toSql = toSqlDate(to);
  const byDay = calendarDaySpan(from, to) < 31;
  const artistJoin = artistId ? "JOIN tracks t ON t.id = i.track_id" : "";
  const where = joinWhere([
    ...interactionDateConditions(from, to),
    ...(artistId ? [`t.artists @> ARRAY[${artistId}]`] : []),
  ]);

  const periodRange = byDay
    ? `
    SELECT generate_series::DATE AS period
    FROM generate_series(DATE '${fromSql}', DATE '${toSql}', INTERVAL 1 DAY)
  `
    : `
    SELECT date_trunc('month', generate_series::DATE)::DATE AS period
    FROM generate_series(
      date_trunc('month', DATE '${fromSql}')::DATE,
      date_trunc('month', DATE '${toSql}')::DATE,
      INTERVAL 1 MONTH
    )
  `;

  const periodExpr = byDay ? "CAST(i.ts AS DATE)" : "date_trunc('month', i.ts)::DATE";

  return { artistJoin, where, byDay, fromSql, toSql, periodRange, periodExpr };
}
