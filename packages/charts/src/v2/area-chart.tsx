import { useMemo, type ReactNode } from "react";

import type { Margin } from "./chart-margin";

import { chartAreaFill } from "./chart-color";
import { chartContainerClassName } from "./chart-container";
import { ChartShell } from "./chart-shell";
import { extractChartConfig } from "./extract-config";
import { makeAreaSeries, useUplotChart } from "./use-uplot-chart";

export interface AreaChartProps {
  /** Data array - each item should have an x-axis key and numeric values */
  data: Record<string, unknown>[];
  /** Key in data for the x-axis. Default: "name" */
  xDataKey?: string;
  /** Container class name (use aspect-* utilities for ratio). Default aspect: 2/1 */
  className?: string;
  /** Chart margins in pixels */
  margin?: Partial<Margin>;
  /** Child components (Area, Grid, XAxis, ChartTooltip, etc.) */
  children: ReactNode;
}

export function AreaChart({
  data,
  xDataKey = "name",
  className,
  margin,
  children,
}: AreaChartProps) {
  const config = useMemo(() => extractChartConfig(children), [children]);

  const buildSeries = useMemo(() => {
    return (_seriesIndex: number, colorToken: string) => {
      if (!config.series) {
        return { points: { show: false } };
      }
      return makeAreaSeries(config.series, chartAreaFill, colorToken);
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

AreaChart.displayName = "AreaChart";

export default AreaChart;
