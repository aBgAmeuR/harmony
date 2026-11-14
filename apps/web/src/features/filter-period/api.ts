import { aggregate } from "@/data/aggregate";
import { isoDay, parseDay } from "@/shared/lib/date";
import { query } from "@/shared/lib/query";

const monthlyFn = async () => {
  const rows = await aggregate<"streams" | "playtime", string>({
    by: "month",
    measures: ["streams", "playtime"],
    filter: {},
  });
  const byMonth = new Map(rows.map((row) => [row.key.slice(0, 7), row]));
  const starts = rows.map((row) => parseDay(row.key)).sort((a, b) => a.getTime() - b.getTime());
  const first = starts[0];
  const last = starts.at(-1);
  if (!first || !last) return [];

  const count =
    (last.getFullYear() - first.getFullYear()) * 12 + last.getMonth() - first.getMonth() + 1;
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(first.getFullYear(), first.getMonth() + i, 1);
    const row = byMonth.get(isoDay(start).slice(0, 7));
    return { start, streams: row?.streams ?? 0, minutes: row?.playtime ?? 0 };
  });
};

const totalsFn = async (filter: { from: Date; to: Date }) => {
  const [row] = await aggregate<"streams" | "playtime", number>({
    by: "all",
    measures: ["streams", "playtime"],
    filter,
  });
  return { streams: row?.streams ?? 0, minutes: row?.playtime ?? 0 };
};

export const monthlyQuery = query("period-monthly", monthlyFn);
export const totalsQuery = query("period-totals", totalsFn);
