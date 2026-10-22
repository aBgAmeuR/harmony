import type {
  ChartAxisPresentationOptions,
  ChartAxisTickLabelContext,
  ChartAxisTickLabelOptions,
  ChartAxisTickOptions,
  ChartGuideLineStyle,
  ChartValue,
} from "@tanstack/charts";

import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";

import { formatNumber } from "./base";

// Harmony scale presets. Each returns a native `scales.x` / `scales.y` entry: override a field by
// spreading it, e.g. `{ ...xBand(), grid: gridDown }`, or hide every guide with `guides: false`.

// Axis without baseline or tick stubs, labels only.
export const quietAxis = <TValue extends ChartValue>(
  ticks: ChartAxisTickOptions<TValue> = {},
): ChartAxisPresentationOptions<TValue> => ({
  line: false,
  ticks: { size: 0, ...ticks },
});

// Background lines: dashed across (y grid), fainter solid down (x grid).
export const gridAcross: ChartGuideLineStyle = {
  stroke: "var(--foreground)",
  strokeOpacity: 0.14,
  strokeDasharray: "3 5",
};
export const gridDown: ChartGuideLineStyle = { stroke: "var(--foreground)", strokeOpacity: 0.07 };

const BAND_PADDING = 0.2;

// Room between the center of the first or last band and the edge of the plot. Zero on a point
// scale, whose first and last points sit on the edges.
const edgeRoom = (bandwidth: number, padding: number): number =>
  bandwidth / 2 + (padding * bandwidth) / (1 - padding);

// Rough width of an 11px tick label: the axis gives no measure to its label options.
const labelWidth = (text: string): number => text.length * 11 * 0.6;

// Keeps the first and last category labels inside the plot: a label that would overflow when
// centered is aligned on the plot edge instead. Labels that fit stay centered.
export const edgeTickLabels = (
  categories: readonly string[],
  padding: number,
  format?: (value: string) => string,
): ChartAxisTickLabelOptions<string> => {
  const first = categories[0];
  const last = categories.at(-1);

  const place = ({ value, bandwidth }: ChartAxisTickLabelContext<string>) => {
    if (value !== first && value !== last) return undefined;
    const room = edgeRoom(bandwidth, padding);
    if (labelWidth(format?.(value) ?? value) / 2 <= room) return undefined;
    return value === first
      ? { anchor: "start" as const, dx: -room }
      : { anchor: "end" as const, dx: room };
  };

  return {
    anchor: (context) => place(context)?.anchor ?? "middle",
    dx: (context) => place(context)?.dx ?? 0,
  };
};

// Category axis. With the categories, the end labels stay inside the plot.
const categoryAxis = (
  padding: number,
  ticks?: ChartAxisTickOptions<string>,
  categories?: readonly string[],
): ChartAxisPresentationOptions<string> => ({
  ...quietAxis(ticks),
  ...(categories ? { tickLabels: edgeTickLabels(categories, padding, ticks?.format) } : {}),
});

// Categories with width, for bars.
export const xBand = (ticks?: ChartAxisTickOptions<string>, categories?: readonly string[]) => ({
  scale: () => scaleBand<string>().padding(BAND_PADDING),
  axis: categoryAxis(BAND_PADDING, ticks, categories),
});

// Categories without width, for lines and areas that span the whole plot.
export const xPoint = (ticks?: ChartAxisTickOptions<string>, categories?: readonly string[]) => ({
  scale: () => scalePoint<string>().padding(0),
  axis: categoryAxis(0, ticks, categories),
});

// Quantity from zero, with the dashed grid and three compact ticks.
export const yValue = (ticks?: ChartAxisTickOptions<number>) => ({
  scale: scaleLinear,
  nice: true,
  grid: gridAcross,
  axis: quietAxis<number>({ count: 3, format: formatNumber, ...ticks }),
});
