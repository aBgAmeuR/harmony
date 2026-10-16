import { Children, isValidElement, type ReactNode } from "react";

import {
  Area,
  Bar,
  Grid,
  Line,
  Marker,
  Tooltip,
  XAxis,
  YAxis,
  type AreaProps,
  type GridProps,
  type BarProps,
  type LineProps,
  type MarkerProps,
  type TooltipProps,
  type XAxisProps,
  type YAxisProps,
} from "./parts";

export type Parts = {
  // Series keep their JSX order.
  series: (
    | { kind: "line"; props: LineProps }
    | { kind: "area"; props: AreaProps }
    | { kind: "bar"; props: BarProps }
  )[];
  markers: MarkerProps[];
  xAxis: XAxisProps | null;
  yAxis: YAxisProps | null;
  grid: GridProps | null;
  tooltip: TooltipProps | null;
};

export const parseParts = (children: ReactNode): Parts => {
  const parts: Parts = {
    series: [],
    markers: [],
    xAxis: null,
    yAxis: null,
    grid: null,
    tooltip: null,
  };

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;

    if (child.type === Line && isValidElement<LineProps>(child)) {
      parts.series.push({ kind: "line", props: child.props });
    } else if (child.type === Area && isValidElement<AreaProps>(child)) {
      parts.series.push({ kind: "area", props: child.props });
    } else if (child.type === Bar && isValidElement<BarProps>(child)) {
      parts.series.push({ kind: "bar", props: child.props });
    } else if (child.type === Marker && isValidElement<MarkerProps>(child)) {
      parts.markers.push(child.props);
    } else if (child.type === XAxis && isValidElement<XAxisProps>(child)) {
      parts.xAxis = child.props;
    } else if (child.type === YAxis && isValidElement<YAxisProps>(child)) {
      parts.yAxis = child.props;
    } else if (child.type === Tooltip && isValidElement<TooltipProps>(child)) {
      parts.tooltip = child.props;
    } else if (child.type === Grid && isValidElement<GridProps>(child)) {
      parts.grid = child.props;
    }
  }

  return parts;
};

// Structure of the parts without their callbacks: when it is unchanged the definition is reused.
export const signature = (parts: Parts): string =>
  JSON.stringify(parts, (_key, value: unknown) => (typeof value === "function" ? "fn" : value));
