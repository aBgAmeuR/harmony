import type { DateRangeMode } from "@/shared/scope";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const toIsoDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
};

export const formatShortDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatMonthYearLabel = (date: Date) => {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const parsePeriodDate = (value: string) => {
  return new Date(`${value}T00:00:00`);
};

export const monthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const formatRangeTitle = (mode: DateRangeMode, from: Date, to: Date) => {
  if (mode === "month") return formatMonthYearLabel(from);
  if (mode === "year") return String(from.getFullYear());
  if (from.getDate() !== 1 || to.getTime() !== monthEnd(to).getTime()) {
    return `${formatShortDate(from)} - ${formatShortDate(to)}`;
  }
  const sameYear = from.getFullYear() === to.getFullYear();
  const start = from.toLocaleDateString("en-US", {
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
  return `${start} - ${to.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
};
