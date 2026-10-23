import { db } from "@harmony/duckdb";

export type PackagePeriod = {
  startDate: string;
  endDate: string;
  days: number;
};

type PackagePeriodRow = {
  start_date: string;
  end_date: string;
  days: number;
};

export const periodFn = async (): Promise<PackagePeriod | null> => {
  const rows = await db.query<PackagePeriodRow>(`
    SELECT
      MIN(CAST(i.ts AS DATE))::VARCHAR AS start_date,
      MAX(CAST(i.ts AS DATE))::VARCHAR AS end_date,
      (date_diff('day', MIN(CAST(i.ts AS DATE)), MAX(CAST(i.ts AS DATE))) + 1)::INTEGER AS days
    FROM interactions i
    WHERE i.ts IS NOT NULL
  `);

  const row = rows[0];
  if (!row?.start_date || !row.end_date) return null;

  return {
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
  };
};
