import type {
  ChartAxisPresentationOptions,
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

// Categories with width, for bars.
export const xBand = (ticks?: ChartAxisTickOptions<string>) => ({
  scale: () => scaleBand<string>().padding(0.2),
  axis: quietAxis(ticks),
});

// Categories without width, for lines and areas that span the whole plot.
export const xPoint = (ticks?: ChartAxisTickOptions<string>) => ({
  scale: () => scalePoint<string>().padding(0),
  axis: quietAxis(ticks),
});

// Quantity from zero, with the dashed grid and three compact ticks.
export const yValue = (ticks?: ChartAxisTickOptions<number>) => ({
  scale: scaleLinear,
  nice: true,
  grid: gridAcross,
  axis: quietAxis<number>({ count: 3, format: formatNumber, ...ticks }),
});
