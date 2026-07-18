import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere, toSqlDate } from "@/lib/sql/date-range";

export type ListeningChartPoint = {
  name: string;
  value: number;
};

export type ListeningDayPart = {
  key: "morning" | "afternoon" | "evening" | "night";
  label: string;
  percentage: number;
};

export type TrackListeningMetrics = {
  monthly: ListeningChartPoint[];
  weekly: ListeningChartPoint[];
  dayParts: ListeningDayPart[];
};

type TrackListeningParams = {
  trackId: number;
  from: Date;
  to: Date;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const DAY_PARTS = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "night", label: "Night" },
] as const;

function calendarDaySpan(from: Date, to: Date): number {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return (toUtc - fromUtc) / 86_400_000;
}

function buildTrackPeriodFilter({ trackId, from, to }: TrackListeningParams) {
  const fromSql = toSqlDate(from);
  const toSql = toSqlDate(to);
  const byDay = calendarDaySpan(from, to) < 31;
  const where = joinWhere([...interactionDateConditions(from, to), `i.track_id = ${trackId}`]);

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
  const nameFormat = byDay ? "%d %b" : "%b %Y";

  return { where, periodRange, periodExpr, nameFormat };
}

export const trackListeningFn = async (
  params: TrackListeningParams,
): Promise<TrackListeningMetrics> => {
  const { where, periodRange, periodExpr, nameFormat } = buildTrackPeriodFilter(params);
  const trackWhere = joinWhere([
    ...interactionDateConditions(params.from, params.to),
    `i.track_id = ${params.trackId}`,
  ]);

  const [monthly, weeklyRows, dayPartRows] = await Promise.all([
    db.query<ListeningChartPoint>(`
      WITH period_range AS (
        ${periodRange}
      ),
      stats AS (
        SELECT
          ${periodExpr} AS period,
          (SUM(i.ms_played) / 60000)::INTEGER AS value
        FROM interactions i
        ${where}
        GROUP BY ${periodExpr}
      )
      SELECT
        strftime(p.period, '${nameFormat}') AS name,
        COALESCE(s.value, 0)::INTEGER AS value
      FROM period_range p
      LEFT JOIN stats s ON s.period = p.period
      ORDER BY p.period
    `),
    db.query<{ day_index: number; value: number }>(`
      SELECT
        ((dayofweek(i.ts) + 6) % 7)::INTEGER AS day_index,
        COUNT(*)::INTEGER AS value
      FROM interactions i
      ${trackWhere}
      GROUP BY day_index
      ORDER BY day_index
    `),
    db.query<{ part_key: string; value: number }>(`
      SELECT
        CASE
          WHEN EXTRACT(HOUR FROM i.ts) >= 5 AND EXTRACT(HOUR FROM i.ts) < 12 THEN 'morning'
          WHEN EXTRACT(HOUR FROM i.ts) >= 12 AND EXTRACT(HOUR FROM i.ts) < 17 THEN 'afternoon'
          WHEN EXTRACT(HOUR FROM i.ts) >= 17 AND EXTRACT(HOUR FROM i.ts) < 21 THEN 'evening'
          ELSE 'night'
        END AS part_key,
        COUNT(*)::INTEGER AS value
      FROM interactions i
      ${trackWhere}
      GROUP BY part_key
    `),
  ]);

  const countByDay = new Map(weeklyRows.map((row) => [row.day_index, row.value]));
  const weekly = DAY_LABELS.map((name, index) => ({
    name,
    value: countByDay.get(index) ?? 0,
  }));

  const countByPart = new Map(dayPartRows.map((row) => [row.part_key, row.value]));
  const totalParts = DAY_PARTS.reduce((sum, part) => sum + (countByPart.get(part.key) ?? 0), 0);
  const dayParts = DAY_PARTS.map((part) => {
    const value = countByPart.get(part.key) ?? 0;
    return {
      key: part.key,
      label: part.label,
      percentage: totalParts > 0 ? Math.round((value / totalParts) * 100) : 0,
    };
  });

  return { monthly, weekly, dayParts };
};
