import type { Curve, Row } from "../types";

// Declarative parts of an XYChart. They render nothing: the chart reads their props to build
// the TanStack definition, the same way `<Line>` or `<Axis>` elements describe a chart.

type SeriesBase = {
  // Key of the numeric column holding the series values.
  dataKey: string;
  // Name shown in the tooltip, defaults to `dataKey`.
  label?: string;
  color?: string;
};

export type LineProps = SeriesBase & {
  dashed?: boolean;
  width?: number;
  curve?: Curve;
};

export type AreaProps = SeriesBase & {
  // Stroke the top edge of the area, on by default.
  line?: boolean;
  width?: number;
  dashed?: boolean;
  curve?: Curve;
};

export type BarProps = Omit<SeriesBase, "color"> & {
  // One color for the series, or a color per row (value-driven bars).
  color?: string | ((row: Row) => string);
  radius?: number;
};

export type MarkerProps = {
  dataKey: string;
  // Row to annotate: the highest or lowest value of `dataKey`.
  at?: "max" | "min";
  label?: string | ((row: Row) => string);
  color?: string;
};

export type XAxisProps = {
  // X values that get a tick, defaults to the automatic ticks.
  ticks?: readonly string[];
  format?: (value: string) => string;
};

export type YAxisProps = {
  // Approximate number of ticks.
  ticks?: number;
  format?: (value: number) => string;
  side?: "left" | "right";
};

export type TooltipProps = {
  // Formats each row value, `suffix` is appended to the default number format.
  format?: (value: number, series: string) => string;
  suffix?: string;
  title?: (x: string) => string;
};

export const Line = (_props: LineProps): null => null;
export const Area = (_props: AreaProps): null => null;
export const Bar = (_props: BarProps): null => null;
export const Marker = (_props: MarkerProps): null => null;
export const XAxis = (_props: XAxisProps): null => null;
export const YAxis = (_props: YAxisProps): null => null;
export type GridProps = {
  // Also draw a line at every x tick, on top of the horizontal lines.
  vertical?: boolean;
};

export const Grid = (_props: GridProps): null => null;
export const Tooltip = (_props: TooltipProps): null => null;
