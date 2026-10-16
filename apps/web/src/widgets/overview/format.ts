import { format } from "@/utils/format";

export const duration = (minutes: number): { value: string; unit: string } =>
  minutes < 60
    ? { value: format.count(minutes), unit: "min" }
    : { value: format.count(minutes / 60), unit: "h" };

export const durationLabel = (minutes: number): string => {
  const { value, unit } = duration(minutes);
  return `${value} ${unit}`;
};

// Hours and minutes of a listening time: "51 h 12 min", "42 min", "142 h".
export const playtimeParts = (minutes: number): { value: string; unit: string }[] => {
  const total = Math.max(Math.round(minutes), 0);
  if (total < 60) return [{ value: String(total), unit: "min" }];

  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours >= 100 || rest === 0) return [{ value: format.count(hours), unit: "h" }];
  return [
    { value: String(hours), unit: "h" },
    { value: String(rest), unit: "m" },
  ];
};

// Relative change vs the previous range, null when there is nothing to compare to.
export const delta = (current: number, previous: number): number | null =>
  previous > 0 ? (current - previous) / previous : null;

export const percent = (part: number, whole: number): number =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

export const shortDate = (value: string): string =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const rangeLabel = (from: string, to: string): string => {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const start = new Date(`${from}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
  return `${start} - ${shortDate(to)}`;
};

const parts = (value: string): [number, number, number] => {
  const [year, month, day] = value.split("-").map(Number);
  return [year ?? 0, month ?? 1, day ?? 1];
};

// Short name for the compared range: "2025", "Feb 2024", otherwise the dates.
export const compareLabel = (from: string, to: string): string => {
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

// "this year" / "this month" when the range is exactly that, otherwise "in this period".
export const periodWord = (from: Date, to: Date): string => {
  const lastDay = new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
  if (from.getDate() !== 1 || to.getDate() !== lastDay) return "in this period";
  if (from.getFullYear() === to.getFullYear()) {
    if (from.getMonth() === 0 && to.getMonth() === 11) return "this year";
    if (from.getMonth() === to.getMonth()) return "this month";
  }
  return "in this period";
};

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
