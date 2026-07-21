import { Children, isValidElement, type ReactNode } from "react";

import { X_AXIS_GAP } from "./axis/x-axis-plugin";
import { getChartChildDescriptor, type SeriesConfig, type SeriesKind } from "./chart-child";

export type { SeriesConfig, SeriesKind } from "./chart-child";

export interface ExtractedChartConfig {
  series: SeriesConfig | null;
  seriesKind: SeriesKind | null;
  showGrid: boolean;
  showXAxis: boolean;
  /** CSS px gap between plot and x-axis labels when showXAxis is true. */
  xAxisGap: number;
  showTooltip: boolean;
  tooltipSuffix: string | null;
}

const EMPTY_CONFIG: ExtractedChartConfig = {
  series: null,
  seriesKind: null,
  showGrid: false,
  showXAxis: false,
  xAxisGap: X_AXIS_GAP,
  showTooltip: false,
  tooltipSuffix: null,
};

export function extractChartConfig(children: ReactNode): ExtractedChartConfig {
  const config: ExtractedChartConfig = { ...EMPTY_CONFIG };

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
        config.series = series;
        config.seriesKind = descriptor.kind;
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
