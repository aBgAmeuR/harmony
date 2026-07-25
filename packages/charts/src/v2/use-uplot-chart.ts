import { useEffect, useMemo, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import type { ExtractedChartConfig } from "./extract-config";

import {
  createHiddenXAxis,
  createHiddenYAxis,
  createSparklineYRange,
  xAxisLabelsPlugin,
} from "./axis/x-axis-plugin";
import { chartColor, resolveSeriesColorToken, type AreaFillPattern } from "./chart-color";
import { toChartData } from "./chart-data";
import { marginToPadding, resolveMargin, type Margin } from "./chart-margin";
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
  /** `seriesIndex` is the uPlot series index (1-based y series). */
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
  const plotRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const { series, showGrid, showXAxis, xAxisGap, showTooltip, tooltipSuffix } = config;

  const prepared = useMemo(() => {
    if (series.length === 0 || data.length === 0) {
      return null;
    }
    return toChartData(
      data,
      xDataKey,
      series.map((entry) => entry.dataKey),
    );
  }, [data, series, xDataKey]);

  useEffect(() => {
    const el = plotRef.current;
    if (!el || !prepared || series.length === 0) {
      return;
    }

    const labelsEl = showXAxis ? labelsRef.current : null;
    if (showXAxis && !labelsEl) {
      return;
    }

    const { chartData, labels } = prepared;

    const plugins: uPlot.Plugin[] = [];
    if (showTooltip) {
      plugins.push(
        createTooltipPlugin({
          labels,
          series: series.map((entry) => ({
            label: entry.label,
            resolveColor: (u) => resolveColorValue(u, entry.stroke ?? entry.fill),
          })),
          suffix: tooltipSuffix ?? undefined,
        }),
      );
    }
    if (showGrid) {
      plugins.push(fadedGridPlugin());
    }
    if (showXAxis && labelsEl) {
      plugins.push(xAxisLabelsPlugin(labels, labelsEl, xAxisGap));
    }

    // Layout size only — getBoundingClientRect includes parent CSS transforms
    // (landing showcase rotate/scale) and desyncs the plot from the HTML label band.
    const readSize = () => ({
      width: el.clientWidth,
      height: el.clientHeight,
    });

    const isSparkline = layout === "sparkline";
    const padding = marginToPadding(resolveMargin(margin));
    const plotSeries: uPlot.Series[] = [
      {},
      ...series.map((entry, index) => {
        const colorToken = resolveSeriesColorToken(entry);
        return buildSeries(index + 1, colorToken);
      }),
    ];

    let chart: uPlot | null = null;

    const mountChart = (width: number, height: number) => {
      if (chart || width <= 0 || height <= 0) {
        return;
      }

      chart = new uPlot(
        {
          width,
          height,
          padding,
          plugins,
          legend: { show: false },
          scales: {
            x: {
              time: false,
              range: (_u, min, max) => (xRangeMode === "bar" ? [min - 0.5, max + 0.5] : [min, max]),
            },
            y: {
              auto: true,
              range: isSparkline
                ? createSparklineYRange()
                : xRangeMode === "bar"
                  ? // Pin baseline to 0 so bars sit flush with the plot bottom;
                    // the HTML label band owns the gap under the plot.
                    (_u, _min, max) => [0, max ?? 1]
                  : undefined,
            },
          },
          // X labels live in a separate HTML band — keep uPlot's axis slot empty.
          axes: [createHiddenXAxis(), createHiddenYAxis()],
          series: plotSeries,
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
    };

    const { width: initialWidth, height: initialHeight } = readSize();
    mountChart(initialWidth, initialHeight);

    const ro = new ResizeObserver(() => {
      const { width, height } = readSize();
      if (!chart) {
        mountChart(width, height);
        return;
      }
      chart.setSize({ width, height });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart?.destroy();
      labelsEl?.replaceChildren();
    };
  }, [
    buildSeries,
    layout,
    margin,
    prepared,
    series,
    showGrid,
    showTooltip,
    showXAxis,
    tooltipSuffix,
    xAxisGap,
    xRangeMode,
  ]);

  return {
    plotRef,
    labelsRef,
    showXAxis,
    xAxisGap,
    hasSeries: series.length > 0,
    isEmpty: data.length === 0,
  };
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
  series: {
    label: string;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    fillPattern?: AreaFillPattern;
  },
  fillFn: (
    u: uPlot,
    colorToken: string,
    topOpacity?: number,
    pattern?: AreaFillPattern,
  ) => CanvasGradient | CanvasPattern | string,
  colorToken: string,
): uPlot.Series {
  const spline = uPlot.paths.spline;

  return {
    label: series.label,
    paths: spline?.({}),
    stroke: (self) => resolveColorValue(self, series.stroke),
    fill: (u) => fillFn(u, colorToken, undefined, series.fillPattern),
    width: series.strokeWidth ?? 2,
    points: { show: false },
  };
}
