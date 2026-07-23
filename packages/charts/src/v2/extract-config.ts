import { Children, isValidElement, type ReactNode } from "react";

import { X_AXIS_GAP } from "./axis/x-axis-plugin";
import { getChartChildDescriptor, type SeriesConfig, type SeriesKind } from "./chart-child";

export type { SeriesConfig, SeriesKind } from "./chart-child";

export interface ExtractedSeries extends SeriesConfig {
  kind: SeriesKind;
}

export interface ExtractedChartConfig {
  series: ExtractedSeries[];
  showGrid: boolean;
  showXAxis: boolean;
  /** CSS px gap between plot and x-axis labels when showXAxis is true. */
  xAxisGap: number;
  showTooltip: boolean;
  tooltipSuffix: string | null;
}

const CHART_COLOR_COUNT = 5;

function defaultSeriesColor(index: number): string {
  return `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`;
}

function withDefaultColors(series: SeriesConfig, index: number): SeriesConfig {
  if (series.fill != null || series.stroke != null) {
    return series;
  }
  const color = defaultSeriesColor(index);
  return { ...series, fill: color, stroke: color };
}

const EMPTY_CONFIG: ExtractedChartConfig = {
  series: [],
  showGrid: false,
  showXAxis: false,
  xAxisGap: X_AXIS_GAP,
  showTooltip: false,
  tooltipSuffix: null,
};

export function extractChartConfig(children: ReactNode): ExtractedChartConfig {
  const config: ExtractedChartConfig = { ...EMPTY_CONFIG, series: [] };

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const descriptor = getChartChildDescriptor(child.type);
    if (!descriptor) {
      return;
    }

    if (descriptor.role === "series") {
      const series = descriptor.extract(child.props);
      if (series) {
        const index = config.series.length;
        config.series.push({
          ...withDefaultColors(series, index),
          kind: descriptor.kind,
        });
      }
      return;
    }

    if (descriptor.role === "grid") {
      config.showGrid = true;
      return;
    }

    if (descriptor.role === "xAxis") {
      config.showXAxis = true;
      const xAxisProps = descriptor.extract?.(child.props);
      const gap = xAxisProps?.gap;
      if (typeof gap === "number" && Number.isFinite(gap)) {
        config.xAxisGap = Math.max(0, gap);
      }
      return;
    }

    if (descriptor.role === "tooltip") {
      config.showTooltip = true;
      const tooltipProps = descriptor.extract?.(child.props);
      const suffix = tooltipProps?.suffix;
      if (typeof suffix === "string" && suffix.length > 0) {
        config.tooltipSuffix = suffix;
      }
    }
  });

  return config;
}
