"use client";

import { cn } from "@harmony/ui/lib/utils";
import { memo, useMemo } from "react";
import { createPortal } from "react-dom";

import { useHeatmap } from "./heatmap-context";
import { getHeatmapColumnMonthAnchor } from "./heatmap-utils";

export interface HeatmapXAxisProps {
  /** Additional class name for labels */
  className?: string;
}

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });

export const HeatmapXAxis = memo(function HeatmapXAxis({ className }: HeatmapXAxisProps) {
  const { container, data, margin, xScale } = useHeatmap();

  const labels = useMemo(() => {
    const ticks: { label: string; x: number; key: string }[] = [];
    let lastMonthKey = "";

    for (let columnIndex = 0; columnIndex < data.length; columnIndex++) {
      const column = data[columnIndex];
      if (!column) {
        continue;
      }

      const monthAnchor = getHeatmapColumnMonthAnchor(column);
      if (!monthAnchor) {
        continue;
      }

      const monthKey = `${monthAnchor.getFullYear()}-${monthAnchor.getMonth()}`;
      if (monthKey === lastMonthKey) {
        continue;
      }

      ticks.push({
        label: monthFmt.format(monthAnchor),
        x: margin.left + xScale(columnIndex),
        key: monthKey,
      });
      lastMonthKey = monthKey;
    }

    return ticks;
  }, [data, margin.left, xScale]);

  if (!container) {
    return null;
  }

  return createPortal(
    labels.map((tick) => (
      <div
        className="pointer-events-none absolute"
        key={tick.key}
        style={{
          top: 0,
          left: tick.x,
          width: 0,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <span className={cn("text-xs whitespace-nowrap text-chart-label", className)}>
          {tick.label}
        </span>
      </div>
    )),
    container,
  );
});

HeatmapXAxis.displayName = "HeatmapXAxis";

export default HeatmapXAxis;
