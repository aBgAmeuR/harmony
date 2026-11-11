import { aggregate } from "@/data/aggregate";
import { query } from "@/shared/lib/query";

export type MonthlyListen = { label: string; value: number };

// Streams per month of the whole package, for the sparkline of the period picker.
const monthlyFn = async (): Promise<MonthlyListen[]> =>
  (await aggregate<"streams", string>({ by: "month", measures: ["streams"], filter: {} }))
    .map((row) => ({ label: row.key.slice(0, 7), value: row.streams }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const monthlyQuery = query("period-monthly", monthlyFn);
