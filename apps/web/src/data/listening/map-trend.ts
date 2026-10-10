import type { ListeningHabitTrendPoint, ListeningHabitTrendRow } from "./types";

export const mapTrendRows = (rows: ListeningHabitTrendRow[]): ListeningHabitTrendPoint[] => {
  return rows.map((row) => ({
    date: row.month instanceof Date ? row.month : new Date(row.month),
    value: row.value,
  }));
};
