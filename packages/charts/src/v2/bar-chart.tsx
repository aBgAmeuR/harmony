import { useMemo, type ReactNode } from "react";

import { chartContainerClassName } from "./chart-container";
import type { Margin } from "./chart-margin";
import { extractChartConfig } from "./extract-config";
import { makeBarSeries, useUplotChart } from "./use-uplot-chart";

export interface BarChartProps {
  /** Data array - each item should have an x-axis key and numeric values */
  data: Record<string, unknown>[];
  /** Key in data for the categorical axis. Default: "name" */
  xDataKey?: string;
  /** Container class name (use aspect-* utilities for ratio). Default aspect: 2/1 */
  className?: string;
  /** Chart margins in pixels */
  margin?: Partial<Margin>;
  /** Child components (Bar, Grid, XAxis, ChartTooltip, etc.) */
  children: ReactNode;
}

export function BarChart({
  data,
  xDataKey = "name",
  className,
  margin,
  children,
}: BarChartProps) {
  const config = useMemo(() => extractChartConfig(children), [children]);

  const buildSeries = useMemo(() => {
    return (_seriesIndex: number, _colorToken: string) => {
      if (!config.series) {
        return { points: { show: false } };
      }
      return makeBarSeries(config.series);
    };
  }, [config.series]);

  const { ref, hasSeries, isEmpty } = useUplotChart({
    data,
    xDataKey,
    config,
    xRangeMode: "bar",
    margin,
    buildSeries,
  });

  if (!hasSeries || isEmpty) {
    return <div className={chartContainerClassName(className)} />;
  }

  return (
    <div className={chartContainerClassName(className)}>
      <div className="absolute inset-0" ref={ref} />
    </div>
  );
}

BarChart.displayName = "BarChart";

export default BarChart;
