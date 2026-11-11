import { parseDay } from "./date";

// A formatted quantity, split so the unit can be styled apart from the value.
export type Part = { value: string; unit?: string };

export type Kind = "count" | "compact" | "percent" | "minutes" | "ratio";

const count = (value: number) => Math.round(value).toLocaleString("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const minutes = (value: number) => {
  const total = Math.max(Math.round(value), 0);
  if (total < 60) return [{ value: String(total), unit: "min" }];

  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours >= 100 || rest === 0) return [{ value: count(hours), unit: "h" }];
  return [
    { value: String(hours), unit: "h" },
    { value: String(rest), unit: "m" },
  ];
};

const kinds: Record<Kind, (value: number) => Part[]> = {
  count: (value) => [{ value: count(value) }],
  compact: (value) => [{ value: compact.format(value) }],
  percent: (value) => [{ value: decimal.format(value * 100), unit: "%" }],
  minutes,
  ratio: (value) => [{ value: decimal.format(value), unit: "x" }],
};

const TIGHT = new Set(["%", "x"]);

export const parts = (value: number, kind: Kind) => kinds[kind](value);

export const format = {
  count,
  as: (value: number, kind: Kind) =>
    parts(value, kind)
      .map(({ value: v, unit }) => (unit ? `${v}${TIGHT.has(unit) ? "" : " "}${unit}` : v))
      .join(" "),
  bytes: (value: number | null | undefined) => {
    if (!value && value !== 0) return "-";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  },
  duration: (value: number | null | undefined) => {
    if (!value && value !== 0) return "-";
    if (value < 1000) return `${value.toFixed(0)} ms`;
    if (value < 60 * 1000) return `${(value / 1000).toFixed(1)} s`;
    if (value < 60 * 60 * 1000) return `${(value / (60 * 1000)).toFixed(1)} min`;
    if (value < 24 * 60 * 60 * 1000) return `${(value / (60 * 60 * 1000)).toFixed(1)} h`;
    return `${(value / (24 * 60 * 60 * 1000)).toFixed(1)} d`;
  },
  date: (value: DateLike) => (value ? shortDate.format(toDate(value)) : "-"),
  dateTime: (value: DateLike) => (value ? dateTime.format(toDate(value)) : "-"),
  time: (value: DateLike) => (value ? time.format(toDate(value)) : "-"),
  month: (value: DateLike) => (value ? month.format(toDate(value)) : "-"),
  longDate: (value: DateLike) => (value ? longDate.format(toDate(value)) : "-"),
};

type DateLike = string | Date | null | undefined;

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const time = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" });
const month = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// DuckDB days ("2024-03-05") and local timestamps ("2024-03-05 21:04:00") as local dates.
export const toDate = (value: string | Date) => {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseDay(value);
  return new Date(value.replace(" ", "T"));
};

const PLATFORMS: Record<string, string> = {
  android: "Android",
  ios: "iOS",
  linux: "Linux",
  other: "Other",
  web_player: "Web",
  windows: "Windows",
  not_applicable: "N/A",
};

export const platformLabel = (platform: string) => PLATFORMS[platform] ?? platform;
