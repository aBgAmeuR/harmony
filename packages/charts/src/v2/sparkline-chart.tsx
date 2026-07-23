import { useMemo, type ReactNode } from "react";

import type { Margin } from "./chart-margin";

import { chartAreaFill } from "./chart-color";
import { chartContainerClassName, DEFAULT_SPARKLINE_ASPECT_CLASS } from "./chart-container";
import { ChartShell } from "./chart-shell";
import { extractChartConfig } from "./extract-config";
import { makeAreaSeries, makeLineSeries, useUplotChart } from "./use-uplot-chart";

export interface SparklineChartProps {
  /** Data array - each item should have an x-axis key and numeric values */
  data: Record<string, unknown>[];
  /** Key in data for the x-axis. Default: "name" */
  xDataKey?: string;
  /** Container class name (use aspect-* utilities for ratio). Default aspect: 6/1 */
  className?: string;
  /** Chart margins in pixels */
  margin?: Partial<Margin>;
  /** Child components (Area or Line; Grid/XAxis/ChartTooltip optional) */
  children: ReactNode;
}

export function SparklineChart({
  data,
  xDataKey = "name",
  className,
  margin,
  children,
}: SparklineChartProps) {
  const config = useMemo(() => extractChartConfig(children), [children]);

  const buildSeries = useMemo(() => {
    return (seriesIndex: number, colorToken: string) => {
      const series = config.series[seriesIndex - 1];
      if (!series) {
        return { points: { show: false } };
      }

      if (series.kind === "line") {
        return makeLineSeries({
          ...series,
          strokeWidth: series.strokeWidth ?? 2,
        });
      }

      return makeAreaSeries(series, chartAreaFill, colorToken);
    };
  }, [config.series]);

  const { plotRef, labelsRef, showXAxis, xAxisGap, hasSeries, isEmpty } = useUplotChart({
    data,
    xDataKey,
    config,
    xRangeMode: "line",
    layout: "sparkline",
    margin,
    buildSeries,
  });

  if (!hasSeries || isEmpty) {
    return <div className={chartContainerClassName(className, DEFAULT_SPARKLINE_ASPECT_CLASS)} />;
  }

  return (
    <ChartShell
      aspectClass={DEFAULT_SPARKLINE_ASPECT_CLASS}
      className={className}
      labelsRef={labelsRef}
      plotRef={plotRef}
      showXAxis={showXAxis}
      xAxisGap={xAxisGap}
    />
  );
}

SparklineChart.displayName = "SparklineChart";

export default SparklineChart;
