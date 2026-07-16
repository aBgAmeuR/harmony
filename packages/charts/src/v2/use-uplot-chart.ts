import { useEffect, useMemo, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import type { ExtractedChartConfig } from "./extract-config";

import {
  createHiddenXAxis,
  createHiddenYAxis,
  createSparklineYRange,
  createXAxis,
  createYRangeWithBottomGap,
  xAxisLabelsPlugin,
} from "./axis/x-axis-plugin";
import { chartColor, resolveSeriesColorToken } from "./chart-color";
import { marginToPadding, resolveMargin, type Margin } from "./chart-margin";
import { toChartData } from "./chart-data";
import { fadedGridPlugin } from "./grid/faded-grid-plugin";
import { createTooltipPlugin } from "./tooltip/tooltip-plugin";

export type XRangeMode = "bar" | "line";
export type ChartLayout = "default" | "sparkline";

export interface UseUplotChartOptions {
  data: Record<string, unknown>[];
  xDataKey: string;
  config: ExtractedChartConfig;
  xRangeMode: XRangeMode;
  layout?: ChartLayout;
  margin?: Partial<Margin>;
  buildSeries: (seriesIndex: number, colorToken: string) => uPlot.Series;
}

function resolveColorValue(u: uPlot, color?: string, fallbackToken = "--chart-1"): string {
  if (!color) {
    return chartColor(u, fallbackToken);
  }
  if (color.startsWith("var(")) {
    return chartColor(u, resolveSeriesColorToken({ stroke: color }));
  }
  return color;
}

export function useUplotChart({
  data,
  xDataKey,
  config,
  xRangeMode,
  layout = "default",
  margin,
  buildSeries,
}: UseUplotChartOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const { series, showGrid, showXAxis, showTooltip, tooltipSuffix } = config;

  const prepared = useMemo(() => {
    if (!series || data.length === 0) {
      return null;
    }
    return toChartData(data, xDataKey, series.dataKey);
  }, [data, series, xDataKey]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !prepared || !series) {
      return;
    }

    const { chartData, labels } = prepared;
    const colorToken = resolveSeriesColorToken(series);
    const resolveTooltipColor = (u: uPlot) => resolveColorValue(u, series.stroke ?? series.fill);

    const plugins: uPlot.Plugin[] = [];
    if (showTooltip) {
      plugins.push(
        createTooltipPlugin({
          labels,
          seriesLabel: series.label,
          resolveColor: resolveTooltipColor,
          suffix: tooltipSuffix ?? undefined,
        }),
      );
    }
    if (showGrid) {
      plugins.push(fadedGridPlugin());
    }
    if (showXAxis) {
      plugins.push(xAxisLabelsPlugin(labels));
    }

    const size = () => {
      const { width, height } = el.getBoundingClientRect();
      return { width, height };
    };

    const isSparkline = layout === "sparkline";

    const padding = marginToPadding(resolveMargin(margin));

    const chart = new uPlot(
      {
        ...size(),
        padding,
        plugins,
        scales: {
          x: {
            time: false,
            range: (_u, min, max) => (xRangeMode === "bar" ? [min - 0.5, max + 0.5] : [min, max]),
          },
          y: {
            auto: true,
            range: isSparkline ? createSparklineYRange() : createYRangeWithBottomGap(),
          },
        },
        axes: [showXAxis ? createXAxis() : createHiddenXAxis(), createHiddenYAxis()],
        series: [{}, buildSeries(1, colorToken)],
        cursor: isSparkline
          ? { show: false }
          : {
              drag: { setScale: false },
              focus: { prox: 24 },
              y: false,
              x: false,
            },
        select: {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          show: false,
        },
      },
      chartData,
      el,
    );

    const ro = new ResizeObserver(() => chart.setSize(size()));
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.destroy();
    };
  }, [
    buildSeries,
    layout,
    margin?.bottom,
    margin?.left,
    margin?.right,
    margin?.top,
    prepared,
    series,
    showGrid,
    showTooltip,
    showXAxis,
    tooltipSuffix,
    xRangeMode,
  ]);

  return { ref, hasSeries: series != null, isEmpty: data.length === 0 };
}

export function makeBarSeries(series: { label: string; fill?: string }): uPlot.Series {
  const bars = uPlot.paths.bars;
  if (!bars) {
    return { label: series.label, points: { show: false } };
  }

  return {
    label: series.label,
    paths: bars({ size: [1, Infinity], gap: 1 }),
    fill: (self) => resolveColorValue(self, series.fill),
    points: { show: false },
  };
}

export function makeLineSeries(series: {
  label: string;
  stroke?: string;
  strokeWidth?: number;
}): uPlot.Series {
  return {
    label: series.label,
    stroke: (self) => resolveColorValue(self, series.stroke),
    width: series.strokeWidth ?? 2,
    points: { show: false },
  };
}

export function makeAreaSeries(
  series: { label: string; stroke?: string; fill?: string; strokeWidth?: number },
  fillFn: (u: uPlot, colorToken: string) => CanvasGradient | string,
  colorToken: string,
): uPlot.Series {
  const spline = uPlot.paths.spline;

  return {
    label: series.label,
    paths: spline?.({}),
    stroke: (self) => resolveColorValue(self, series.stroke),
    fill: (u) => fillFn(u, colorToken),
    width: series.strokeWidth ?? 2,
    points: { show: false },
  };
}
