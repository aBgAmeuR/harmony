import type { Ref } from "react";

import { cn } from "@harmony/ui/lib/utils";

import { xAxisBandHeight } from "./axis/x-axis-plugin";
import { chartContainerClassName, DEFAULT_CHART_ASPECT_CLASS } from "./chart-container";

export interface ChartShellProps {
  className?: string;
  aspectClass?: string;
  showXAxis: boolean;
  /** CSS px gap between plot and x-axis labels. */
  xAxisGap: number;
  plotRef: Ref<HTMLDivElement>;
  labelsRef: Ref<HTMLDivElement>;
}

/** Shared plot + optional HTML x-axis label band. */
export function ChartShell({
  className,
  aspectClass = DEFAULT_CHART_ASPECT_CLASS,
  showXAxis,
  xAxisGap,
  plotRef,
  labelsRef,
}: ChartShellProps) {
  const bandHeight = showXAxis ? xAxisBandHeight(xAxisGap) : 0;

  return (
    <div className={chartContainerClassName(className, aspectClass)}>
      <div className="absolute inset-x-0 top-0" ref={plotRef} style={{ bottom: bandHeight }} />
      {showXAxis ? (
        <div
          className={cn("pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden")}
          ref={labelsRef}
          style={{ height: bandHeight }}
        />
      ) : null}
    </div>
  );
}
