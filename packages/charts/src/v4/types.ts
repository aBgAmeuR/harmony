import type { ChartValue } from "@tanstack/charts";

// A data row. Charts read values by key, so rows only need string keys.
export type Row = Record<string, unknown>;

export type Curve = "linear" | "monotone";

export const toNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const toLabel = (value: unknown): string =>
  typeof value === "string" ? value : value instanceof Date ? value.toISOString() : String(value);

export const toChartValue = (value: unknown): ChartValue =>
  typeof value === "number" || typeof value === "string" || value instanceof Date
    ? value
    : String(value);
