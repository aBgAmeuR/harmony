import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/data/sql/date-range";

import type { Range } from "./range";

export type Habits = {
  // grid[day][hour], Monday first
  grid: number[][];
  max: number;
};

type HabitRow = { day: number; hour: number; value: number };

export const habitsFn = async ({ from, to }: Range): Promise<Habits> => {
  const rows = await db.query<HabitRow>(`
    SELECT
      ((dayofweek(i.ts) + 6) % 7)::INTEGER AS day,
      EXTRACT(HOUR FROM i.ts)::INTEGER AS hour,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    ${joinWhere(interactionDateConditions(from, to))}
    GROUP BY ALL
  `);

  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  let max = 0;
  for (const row of rows) {
    const cells = grid[row.day];
    if (!cells) continue;
    cells[row.hour] = row.value;
    max = Math.max(max, row.value);
  }

  return { grid, max };
};
