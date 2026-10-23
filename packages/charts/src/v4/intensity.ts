import type { ChartColorOptions } from "@tanstack/charts";

// Magnitude ramp shared by heatmaps and value-colored bars. Level 0 is empty, the others follow
// the chart scale from dim to bright.
export const intensityLevels = [
  "var(--muted)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
] as const;

const TOP = intensityLevels.length - 1;

// Level of `value` relative to `max`, for a mark `color` channel read by `intensityColor`.
export const intensityLevel = (value: number, max: number): number =>
  value <= 0 || max <= 0 ? 0 : Math.min(TOP, Math.ceil((value / max) * TOP));

// Chart `color` option mapping each level to its step of the ramp.
export const intensityColor: ChartColorOptions = {
  domain: intensityLevels.map((_, level) => level),
  range: intensityLevels,
};

// The color itself, for marks painted with a `fill` accessor.
export const intensity = (value: number, max: number): string =>
  intensityLevels[intensityLevel(value, max)] ?? "var(--chart-1)";
