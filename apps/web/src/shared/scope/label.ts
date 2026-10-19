import type { DateRangeMode } from "./period";

const month = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export const periodLabel = (mode: DateRangeMode, from: Date, to: Date): string => {
  if (mode === "month") return month.format(from);
  if (mode === "year") return String(from.getFullYear());
  return `${day.format(from)} - ${day.format(to)}`;
};
