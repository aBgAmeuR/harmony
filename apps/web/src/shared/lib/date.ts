// Calendar days in local time. A period is a pair of days, both included.
export type Range = { from: Date; to: Date };

export const isoDay = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

// "2024-03-05" (or a longer ISO string) as the local day it names.
export const parseDay = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// Whole days from `from` to `to`, safe across daylight saving changes.
const daySpan = (from: Date, to: Date) =>
  (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
  86_400_000;

export const rangeDays = ({ from, to }: Range) => daySpan(from, to) + 1;

const lastDayOfMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const isEndOfMonth = (date: Date) =>
  date.getDate() === lastDayOfMonth(date.getFullYear(), date.getMonth());

const isWholeMonths = ({ from, to }: Range) => from.getDate() === 1 && isEndOfMonth(to);

export const monthCount = ({ from, to }: Range) =>
  (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;

const shiftMonths = (date: Date, months: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = lastDayOfMonth(target.getFullYear(), target.getMonth());
  const day = isEndOfMonth(date) ? last : Math.min(date.getDate(), last);
  return new Date(target.getFullYear(), target.getMonth(), day);
};

// The same stretch of the previous period. `full` is the range the user picked: it decides whether
// we shift by months (a month, a year...) or by days, `range` may be shorter once clamped.
export const previousRange = (range: Range, full: Range = range) => {
  if (isWholeMonths(full)) {
    const months = monthCount(full);
    return { from: shiftMonths(range.from, -months), to: shiftMonths(range.to, -months) };
  }
  const days = rangeDays(full);
  return { from: addDays(range.from, -days), to: addDays(range.to, -days) };
};

// Ends the range on the package's last listening day, so empty future months are not counted.
export const clampRange = (range: Range, endDay: string | undefined) => {
  if (!endDay) return range;
  const end = parseDay(endDay);
  return end >= range.from && end < range.to ? { from: range.from, to: end } : range;
};
