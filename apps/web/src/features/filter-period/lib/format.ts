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

export const isDateInRange = (date: Date, startDate?: Date, endDate?: Date) => {
  const timestamp = date.getTime();
  return timestamp >= (startDate?.getTime() ?? 0) && timestamp <= (endDate?.getTime() ?? Infinity);
};
