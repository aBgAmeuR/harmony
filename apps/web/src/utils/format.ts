// A formatted quantity, split so the unit can be styled apart from the value.
export type Part = { value: string; unit?: string };

export type Kind = "count" | "compact" | "percent" | "minutes" | "ratio";

const count = (value: number): string => Math.round(value).toLocaleString("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

// Listening time in minutes: "42 min", "51 h 12 m", "142 h".
const minutes = (value: number): Part[] => {
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
  // A fraction between 0 and 1.
  percent: (value) => [{ value: decimal.format(value * 100), unit: "%" }],
  minutes,
  ratio: (value) => [{ value: decimal.format(value), unit: "x" }],
};

// Units written right after the value, without a space.
const TIGHT = new Set(["%", "x"]);

export const parts = (value: number, kind: Kind): Part[] => kinds[kind](value);

export const format = {
  count,
  // Any kind as plain text, for labels, tooltips and aria: "51 h 12 m", "42%", "1.4x".
  as: (value: number, kind: Kind): string =>
    parts(value, kind)
      .map(({ value: v, unit }) => (unit ? `${v}${TIGHT.has(unit) ? "" : " "}${unit}` : v))
      .join(" "),
  bytes: (value: number | null | undefined): string => {
    if (!value && value !== 0) return "-";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  },
  duration: (value: number | null | undefined): string => {
    if (!value && value !== 0) return "-";
    if (value < 1000) return `${value.toFixed(0)} ms`;
    if (value < 60 * 1000) return `${(value / 1000).toFixed(1)} s`;
    if (value < 60 * 60 * 1000) return `${(value / (60 * 1000)).toFixed(1)} min`;
    if (value < 24 * 60 * 60 * 1000) return `${(value / (60 * 60 * 1000)).toFixed(1)} h`;
    return `${(value / (24 * 60 * 60 * 1000)).toFixed(1)} d`;
  },
  date: (value: string | null | undefined | Date): string => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleDateString();
  },
  time: (value: string | null | undefined | Date): string => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleTimeString();
  },
};
