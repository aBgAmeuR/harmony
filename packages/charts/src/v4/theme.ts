import type { ChartTheme } from "@tanstack/charts";
import type { CSSProperties } from "react";

import "./css-vars";

// Harmony tokens, resolved by the browser so the chart follows the app theme.
export const colors = {
  primary: "var(--chart-1)",
  scale: ["var(--chart-5)", "var(--chart-4)", "var(--chart-3)", "var(--chart-2)", "var(--chart-1)"],
  muted: "var(--muted-foreground)",
  empty: "var(--muted)",
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
};

// CSS variables read by the built-in tooltip, see the Themes and Styling guide.
export const tooltipStyle: CSSProperties = {
  "--ts-chart-tooltip-background": "var(--popover)",
  "--ts-chart-tooltip-color": "var(--popover-foreground)",
  "--ts-chart-tooltip-border": "1px solid var(--border)",
  "--ts-chart-tooltip-border-radius": "var(--radius-md)",
  "--ts-chart-tooltip-padding": "8px 10px",
};

// Tween played when the data of a chart changes. Marks are keyed, so surviving geometry morphs.
export const animation = { duration: 450, easing: "ease-out" } as const;
