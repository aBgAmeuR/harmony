import { db } from "@harmony/duckdb";

import type { MonthlyListen } from "../types";

export const monthlyListensFn = async () => {
  return await db.query<MonthlyListen>(`
    SELECT
      strftime(date_trunc('month', i.ts), '%Y-%m') AS label,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    GROUP BY date_trunc('month', i.ts)
    ORDER BY date_trunc('month', i.ts)
  `);
};
