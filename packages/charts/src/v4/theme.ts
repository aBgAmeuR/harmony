import type { ChartTheme } from "@tanstack/charts";

// Harmony tokens, resolved by the browser so the chart follows the app theme.
export const colors = {
  primary: "var(--chart-1)",
  // Green tiers from bright to dim, for categories (slices, stages, segments). DESIGN.md asks
  // for tonal charts rather than unrelated categorical colors.
  tiers: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"],
  muted: "var(--muted-foreground)",
  background: "var(--background)",
} as const;

export const harmonyTheme: Partial<ChartTheme> = {
  foreground: "var(--foreground)",
  muted: "var(--muted-foreground)",
  grid: "var(--border)",
  background: "transparent",
  palette: [
    "var(--chart-1)",
    "var(--muted-foreground)",
    "var(--chart-3)",
    "var(--chart-2)",
    "var(--chart-4)",
  ],
  // The built-in ring lands on every focused mark, bars and labels included. The cursor marks
  // (`columnGuide`, `columnBand`) draw focus instead; a chart opts back in with `focusDot`.
  focusRing: false,
};

// Small dot on the focused point: background fill, ringed in the series color.
export const focusDot = { radius: 3.5, fill: "var(--background)", strokeWidth: 2 } as const;

// Tween played when the data of a chart changes. Marks are keyed, so surviving geometry morphs.
export const dataMotion = { type: "tween", duration: 450, easing: "ease-out" } as const;

// Short glide of the tooltip and the cursor between two focused points.
export const glide = { type: "tween", duration: 140, easing: "ease-out" } as const;
