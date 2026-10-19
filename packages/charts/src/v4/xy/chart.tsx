import type { ChartMargin } from "@tanstack/charts";
import type { ReactNode } from "react";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import type { Row } from "../types";
import type { Reader } from "./build";

import { ChartSurface } from "../surface";
import { buildXY } from "./build";
import { parseParts, signature } from "./parse";
import { Area, Bar, Grid, Line, Marker, Tooltip, XAxis, YAxis } from "./parts";

export type XYChartProps<TDatum extends Row> = {
  data: readonly TDatum[];
  // Key of the column used as x. Values are ordered categories, such as dates already formatted.
  x: string;
  ariaLabel: string;
  height?: number;
  aspectRatio?: number;
  className?: string;
  // Fixed plot margins, use the same value on charts that must line up.
  margin?: number | Partial<ChartMargin>;
  // Upper bound of the y axis, to share one scale between several charts.
  yMax?: number;
  // Called with the x value of the clicked point or bar.
  onSelect?: (x: string) => void;
  children?: ReactNode;
};

const Root = <TDatum extends Row>({
  data,
  x,
  ariaLabel,
  height,
  aspectRatio,
  className,
  margin,
  yMax,
  onSelect,
  children,
}: XYChartProps<TDatum>) => {
  const parts = parseParts(children);

  // Callbacks are read through this ref, so a new inline function does not rebuild the chart.
  const latest = useRef(parts);
  useLayoutEffect(() => {
    latest.current = parts;
  });

  // The same object until a series, axis or option changes: it is what the definition depends on.
  const key = signature(parts);
  const [stable, setStable] = useState({ key, parts });
  if (stable.key !== key) setStable({ key, parts });
  const structure = stable.key === key ? stable.parts : parts;

  const read = useMemo<Reader>(
    () => ({
      tooltip: () => latest.current.tooltip,
      xAxis: () => latest.current.xAxis,
      yAxis: () => latest.current.yAxis,
      marker: (index) => latest.current.markers[index],
      bar: (dataKey) => {
        for (const series of latest.current.series) {
          if (series.kind === "bar" && series.props.dataKey === dataKey) return series.props;
        }
        return undefined;
      },
    }),
    [],
  );

  const definition = useMemo(
    // `read` closures run at tooltip/axis time, after commit, never during this build.
    // oxlint-disable-next-line react/refs
    () => buildXY({ data, x, parts: structure, read, margin, yMax }),
    [data, x, structure, read, margin, yMax],
  );

  return (
    <ChartSurface
      definition={definition}
      ariaLabel={ariaLabel}
      height={height}
      aspectRatio={aspectRatio}
      className={className}
      onSelectX={onSelect}
    />
  );
};

export const XYChart = Object.assign(Root, {
  Line,
  Area,
  Bar,
  Marker,
  XAxis,
  YAxis,
  Grid,
  Tooltip,
});

// The same chart under the name matching its main series.
export const AreaChart = XYChart;
export const LineChart = XYChart;
export const BarChart = XYChart;
