import { toSqlDate } from "@/data/sql/date-range";
import { calendarDaySpan } from "@/data/sql/period-range";

export type Range = {
  from: Date;
  to: Date;
};

const lastDayOfMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

const isEndOfMonth = (date: Date): boolean =>
  date.getDate() === lastDayOfMonth(date.getFullYear(), date.getMonth());

const isWholeMonths = ({ from, to }: Range): boolean => from.getDate() === 1 && isEndOfMonth(to);

const shiftMonths = (date: Date, months: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = lastDayOfMonth(target.getFullYear(), target.getMonth());
  const day = isEndOfMonth(date) ? last : Math.min(date.getDate(), last);
  return new Date(target.getFullYear(), target.getMonth(), day);
};

// Ends the range on the package's last listening day, so empty future months are not counted.
export const clampRange = (range: Range, endDate: string | undefined): Range => {
  if (!endDate) return range;
  const [year, month, day] = endDate.split("-").map(Number);
  if (!year || !month || !day) return range;

  const end = new Date(year, month - 1, day);
  return end >= range.from && end < range.to ? { from: range.from, to: end } : range;
};

// The same stretch of the previous period. `full` is the range the user picked: it decides whether
// we shift by months (a month, a year...) or by days, `range` may be shorter once clamped.
export const previousRange = (range: Range, full: Range = range): Range => {
  if (isWholeMonths(full)) {
    const months =
      (full.to.getFullYear() - full.from.getFullYear()) * 12 +
      full.to.getMonth() -
      full.from.getMonth() +
      1;
    return { from: shiftMonths(range.from, -months), to: shiftMonths(range.to, -months) };
  }

  const days = calendarDaySpan(full.from, full.to) + 1;
  const shift = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
  return { from: shift(range.from), to: shift(range.to) };
};

export type Unit = "day" | "week" | "month";

export type Buckets = {
  unit: Unit;
  count: number;
  // SQL expression giving the 0-based bucket index of an interaction `i`.
  index: string;
  labels: string[];
  // x-axis labels: month names for weekly buckets, otherwise the bucket labels themselves
  ticks: string[];
};

const DAILY_MAX_DAYS = 92;
const WEEKLY_MAX_DAYS = 800;

export const bucketUnit = ({ from, to }: Range): Unit => {
  const days = calendarDaySpan(from, to) + 1;
  if (days <= DAILY_MAX_DAYS) return "day";
  return days <= WEEKLY_MAX_DAYS ? "week" : "month";
};

export const bucketCount = (range: Range, unit: Unit): number => {
  const { from, to } = range;
  const days = calendarDaySpan(from, to) + 1;
  if (unit === "day") return days;
  if (unit === "week") return Math.ceil(days / 7);
  return (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;
};

const shortMonth = (date: Date): string => date.toLocaleDateString("en-US", { month: "short" });

// Buckets are positional so the current and previous ranges line up index by index.
export const buildBuckets = (range: Range, unit: Unit, count: number): Buckets => {
  const { from } = range;
  const fromSql = toSqlDate(from);

  const index = {
    day: `date_diff('day', DATE '${fromSql}', CAST(i.ts AS DATE))`,
    week: `(date_diff('day', DATE '${fromSql}', CAST(i.ts AS DATE)) // 7)`,
    month: `date_diff('month', date_trunc('month', DATE '${fromSql}')::DATE, date_trunc('month', i.ts)::DATE)`,
  }[unit];

  const starts = Array.from({ length: count }, (_, n) =>
    unit === "month"
      ? new Date(from.getFullYear(), from.getMonth() + n, 1)
      : new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate() + n * (unit === "week" ? 7 : 1),
        ),
  );

  // Labels are x categories, so they must stay unique when the range crosses a year.
  const withYear = unit === "month" || starts[0]?.getFullYear() !== starts.at(-1)?.getFullYear();
  const labels = starts.map((date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      ...(unit === "month" ? {} : { day: "numeric" }),
      ...(withYear ? { year: "numeric" } : {}),
    }),
  );

  const ticks =
    unit === "week"
      ? starts.map((date, n) =>
          n === 0 || date.getMonth() !== starts[n - 1]?.getMonth() ? shortMonth(date) : "",
        )
      : labels;

  return { unit, count, index, labels, ticks };
};
