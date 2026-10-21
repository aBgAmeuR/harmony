import { db } from "@harmony/duckdb";

import type { ListeningDay, WhenYouListenByYear } from "./types";

type DailyCountRow = {
  date: string | Date;
  value: number;
};

const DAYS_IN_WEEK = 7;

const parseDate = (value: string | Date): Date => {
  return value instanceof Date ? value : new Date(value);
};

const dateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sundayOnOrBefore = (date: Date): Date => {
  const sunday = new Date(date);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(sunday.getDate() - sunday.getDay());
  return sunday;
};

// Every day of the year, placed in its Sunday-based week column.
const buildYearHeatmap = (year: number, countsByDate: Map<string, number>): ListeningDay[] => {
  const days: ListeningDay[] = [];
  const firstWeek = sundayOnOrBefore(new Date(year, 0, 1));

  for (
    let date = new Date(year, 0, 1);
    date.getFullYear() === year;
    date.setDate(date.getDate() + 1)
  ) {
    const day = new Date(date);
    const week = Math.round(
      (sundayOnOrBefore(day).getTime() - firstWeek.getTime()) / (DAYS_IN_WEEK * 86_400_000),
    );
    days.push({ date: day, week, day: day.getDay(), count: countsByDate.get(dateKey(day)) ?? 0 });
  }

  return days;
};

const toHeatmapsByYear = (rows: DailyCountRow[]): WhenYouListenByYear => {
  const countsByDate = new Map<string, number>();
  const years = new Set<number>();

  for (const row of rows) {
    const date = parseDate(row.date);
    countsByDate.set(dateKey(date), row.value);
    years.add(date.getFullYear());
  }

  return Object.fromEntries([...years].map((year) => [year, buildYearHeatmap(year, countsByDate)]));
};

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
