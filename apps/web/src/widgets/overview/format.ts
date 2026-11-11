import { isoDay, previousRange, type Range } from "@/shared/lib/date";
import { format } from "@/shared/lib/format";

export const delta = (current: number, previous: number) =>
  previous > 0 ? (current - previous) / previous : null;

export const rangeLabel = (from: string, to: string) => {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const start = new Date(`${from}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
  return `${start} - ${format.date(to)}`;
};

const parts = (value: string): [number, number, number] => {
  const [year, month, day] = value.split("-").map(Number);
  return [year ?? 0, month ?? 1, day ?? 1];
};

export const compareLabel = (from: string, to: string) => {
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  const lastDay = new Date(ty, tm, 0).getDate();

  if (fd === 1 && td === lastDay) {
    if (fy === ty && fm === 1 && tm === 12) return String(fy);
    if (fy === ty && fm === tm) {
      return new Date(fy, fm - 1, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  }
  return rangeLabel(from, to);
};

export const periodWord = (from: Date, to: Date) => {
  const lastDay = new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
  if (from.getDate() !== 1 || to.getDate() !== lastDay) return "in this period";
  if (from.getFullYear() === to.getFullYear()) {
    if (from.getMonth() === 0 && to.getMonth() === 11) return "this year";
    if (from.getMonth() === to.getMonth()) return "this month";
  }
  return "in this period";
};

export const periodNames = (full: Range) => {
  const previous = previousRange(full, full);
  return {
    current: compareLabel(isoDay(full.from), isoDay(full.to)),
    previous: compareLabel(isoDay(previous.from), isoDay(previous.to)),
  };
};
