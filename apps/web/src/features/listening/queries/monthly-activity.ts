import { db } from "@harmony/duckdb";

import type { MonthlyActivityPoint } from "../types";

export const monthlyActivityFn = async (): Promise<MonthlyActivityPoint[]> => {
  return await db.query<MonthlyActivityPoint>(`
    SELECT
      strftime(date_trunc('month', i.ts), '%b %Y') AS name,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    WHERE i.ts IS NOT NULL
    GROUP BY date_trunc('month', i.ts)
    ORDER BY date_trunc('month', i.ts)
  `);
};
