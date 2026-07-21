import { useMemo, type ReactNode } from "react";

import type { Margin } from "./chart-margin";

import { chartContainerClassName } from "./chart-container";
import { ChartShell } from "./chart-shell";
import { extractChartConfig } from "./extract-config";
import { makeLineSeries, useUplotChart } from "./use-uplot-chart";

export interface LineChartProps {
  /** Data array - each item should have an x-axis key and numeric values */
  data: Record<string, unknown>[];
  /** Key in data for the x-axis. Default: "name" */
  xDataKey?: string;
  /** Container class name (use aspect-* utilities for ratio). Default aspect: 2/1 */
  className?: string;
  /** Chart margins in pixels */
  margin?: Partial<Margin>;
  /** Child components (Line, Grid, XAxis, ChartTooltip, etc.) */
  children: ReactNode;
}

export function LineChart({
  data,
  xDataKey = "name",
  className,
  margin,
  children,
}: LineChartProps) {
  const config = useMemo(() => extractChartConfig(children), [children]);

  const buildSeries = useMemo(() => {
    return (_seriesIndex: number, _colorToken: string) => {
      if (!config.series) {
        return { points: { show: false } };
      }
      return makeLineSeries(config.series);
    };
  }, [config.series]);

  const { plotRef, labelsRef, showXAxis, xAxisGap, hasSeries, isEmpty } = useUplotChart({
    data,
    xDataKey,
    config,
    xRangeMode: "line",
    margin,
    buildSeries,
  });

  if (!hasSeries || isEmpty) {
    return <div className={chartContainerClassName(className)} />;
  }

  return (
    <ChartShell
      className={className}
      labelsRef={labelsRef}
      plotRef={plotRef}
      showXAxis={showXAxis}
      xAxisGap={xAxisGap}
    />
  );
}

LineChart.displayName = "LineChart";

export default LineChart;
