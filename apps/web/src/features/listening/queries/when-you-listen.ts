import type { HeatmapColumn } from "@harmony/charts";

import { db } from "@harmony/duckdb";

import type { WhenYouListenByYear } from "../types";

type DailyCountRow = {
  date: string | Date;
  value: number;
};

const DAYS_IN_WEEK = 7;

function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sundayOnOrBefore(date: Date): Date {
  const sunday = new Date(date);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(sunday.getDate() - sunday.getDay());
  return sunday;
}

function buildYearHeatmap(year: number, countsByDate: Map<string, number>): HeatmapColumn[] {
  const columns: HeatmapColumn[] = [];
  let weekStart = sundayOnOrBefore(new Date(year, 0, 1));
  const lastWeekStart = sundayOnOrBefore(new Date(year, 11, 31));

  for (let week = 0; weekStart <= lastWeekStart; week++) {
    columns.push({
      bin: week,
      bins: Array.from({ length: DAYS_IN_WEEK }, (_, day) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + day);

        const inYear = date.getFullYear() === year;
        const count = inYear ? (countsByDate.get(dateKey(date)) ?? 0) : 0;

        return { bin: day, date, count };
      }),
    });

    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() + DAYS_IN_WEEK);
  }

  return columns;
}

function toHeatmapsByYear(rows: DailyCountRow[]): WhenYouListenByYear {
  const countsByDate = new Map<string, number>();
  const years = new Set<number>();

  for (const row of rows) {
    const date = parseDate(row.date);
    countsByDate.set(dateKey(date), row.value);
    years.add(date.getFullYear());
  }

  return Object.fromEntries([...years].map((year) => [year, buildYearHeatmap(year, countsByDate)]));
}

export const whenYouListenFn = async (): Promise<WhenYouListenByYear> => {
  const rows = await db.query<DailyCountRow>(`
    SELECT
      CAST(i.ts AS DATE) AS date,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    WHERE i.ts IS NOT NULL
    GROUP BY CAST(i.ts AS DATE)
    ORDER BY date
  `);

  return toHeatmapsByYear(rows);
};
