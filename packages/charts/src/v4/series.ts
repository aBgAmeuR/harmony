import type { ChartColorOptions, ChartPoint, ChartTooltipContentContext } from "@tanstack/charts";

import { crosshair } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";
import { portal } from "@tanstack/charts/tooltip/portal";

import { formatNumber } from "./base";
import { focusDot, glide } from "./theme";

// Series of a chart, keyed by the value of the marks' `z` channel, like shadcn's `ChartConfig`.
// It is the one place that names, colors and formats each series.
export type Series = Record<
  string,
  {
    label: string;
    color: string;
    // Value text in tooltips, the Harmony number format by default.
    format?: (value: number) => string;
  }
>;

// Chart `color` option: each series keeps its color whatever data is shown.
export const seriesColor = (series: Series): ChartColorOptions => ({
  domain: Object.keys(series),
  range: Object.values(series).map((entry) => entry.color),
});

// Built-in tooltip, portaled above clipped panels. A click must not pin it.
export const tooltipBase = {
  use: tooltip,
  portal,
  sticky: false,
  motion: glide,
  placement: ["top", "right", "left", "bottom"] as const,
  offset: 12,
};

type ColumnOptions = {
  // Tooltip title from the x value. Only for a chart without x axis: the cursor already writes
  // the x value on the axis.
  title?: (x: string) => string;
};

// Inspection of a column: hovering an x focuses every series there and lists them in the
// tooltip, in chart order. Spread it into the spec, next to a `columnGuide()` or `columnBand()`.
export const columnTooltip = (series: Series, { title }: ColumnOptions = {}) => ({
  focus: "group-x" as const,
  maxFocusDistance: Number.POSITIVE_INFINITY,
  tooltip: {
    ...tooltipBase,
    // Beside the column rather than over it, so the inspected marks stay visible.
    anchor: "group-center" as const,
    placement: ["right", "left", "top", "bottom"] as const,
    content: (points: readonly ChartPoint[], context: ChartTooltipContentContext) => {
      const x = points[0] ? String(points[0].xValue) : undefined;
      return {
        title: x !== undefined && title ? title(x) : undefined,
        rows: points.map((point) => ({
          label: series[point.groupLabel]?.label ?? point.groupLabel,
          value:
            typeof point.yValue === "number"
              ? (series[point.groupLabel]?.format ?? formatNumber)(point.yValue)
              : String(point.yValue),
          color: point.color,
          active: points.length > 1 && point === context.primaryPoint,
        })),
      };
    },
  },
});

type CursorOptions = {
  // Writes the inspected x value on the axis, over its tick. Turn it off when the x axis is hidden.
  label?: boolean;
};

// Inspected x value in white, at the exact place of the tick label (padding 4, 11px). Its halo,
// in the page color, hides the neighbouring ticks it covers.
const axisLabel = {
  offset: 4,
  fontSize: 11,
  fontWeight: 500,
  fill: "var(--foreground)",
  stroke: "var(--background)",
  strokeWidth: 6,
};

// Cursor of a line or area chart: a faint vertical rule, a dot on the focused point and the x
// value on the axis.
export const columnGuide = ({ label = true }: CursorOptions = {}) =>
  crosshair({
    id: "column-guide",
    x: { stroke: "var(--foreground)", strokeOpacity: 0.16, label: label && axisLabel },
    y: false,
    marker: focusDot,
    motion: { transition: glide },
  });

// Cursor of a bar chart: a soft wash over the whole inspected column and the x value on the
// axis. It needs a band x scale.
export const columnBand = ({ label = true }: CursorOptions = {}) =>
  crosshair({
    id: "column-band",
    x: {
      band: { fill: "var(--foreground)", fillOpacity: 0.05, inset: -2, radius: 3 },
      label: label && axisLabel,
    },
    y: false,
    motion: { transition: glide },
  });

type PointLine = { title: string; label: string; value: string };

// Tooltip of one focused datum: a title and one labeled value, with the mark's color. Type the
// `describe` parameter with the chart's row type.
export const pointTooltip = <TDatum>(describe: (datum: TDatum) => PointLine) => ({
  ...tooltipBase,
  content: ([point]: readonly ChartPoint<TDatum>[]) => {
    if (!point) return { rows: [] };
    const { title, label, value } = describe(point.datum);
    return { title, rows: [{ label, value, color: point.color }] };
  },
});
