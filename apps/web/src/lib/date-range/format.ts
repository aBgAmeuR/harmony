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

export function toIsoDate(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthYearLabel(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function parsePeriodDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function isDateInRange(date: Date, startDate?: Date, endDate?: Date): boolean {
  const timestamp = date.getTime();
  return timestamp >= (startDate?.getTime() ?? 0) && timestamp <= (endDate?.getTime() ?? Infinity);
}
