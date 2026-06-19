"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@harmony/ui/lib/utils";
import { useChart, useChartStable, useYScale } from "./chart-context";
import { resolveYAxisTickCount } from "./y-axis-ticks";

export interface BarValueYAxisProps {
  /** Number of tick labels. Default: 5 */
  numTicks?: number;
  /** Y-scale id when multiple axes are used. */
  yAxisId?: string | number;
  /** Format numeric tick values for display. */
  formatTick?: (value: number) => string;
}

function formatDefaultTick(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function BarValueYAxisLabel({ label, y }: { label: string; y: number }) {
  return (
    <div
      className="absolute right-0 flex -translate-y-1/2 items-center justify-end pr-2"
      style={{ top: y }}
    >
      <span
        className={cn("whitespace-nowrap text-right text-chart-label text-xs")}
      >
        {label}
      </span>
    </div>
  );
}

export function BarValueYAxis(props: BarValueYAxisProps) {
  const { containerRef } = useChartStable();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  return <BarValueYAxisInner {...props} container={container} />;
}

const BarValueYAxisInner = memo(function BarValueYAxisInner({
  numTicks,
  yAxisId,
  formatTick = formatDefaultTick,
  container,
}: BarValueYAxisProps & { container: HTMLDivElement }) {
  const { margin } = useChart();
  const yScale = useYScale(yAxisId);

  const ticksToShow = useMemo(() => {
    const tickCount = resolveYAxisTickCount(numTicks);
    const ticks = yScale.ticks(tickCount);

    return ticks.map((value) => ({
      value,
      label: formatTick(value),
      y: (yScale(value) ?? 0) + margin.top,
    }));
  }, [formatTick, margin.top, numTicks, yScale]);

  return createPortal(
    <div
      className="pointer-events-none absolute top-0 bottom-0"
      style={{
        left: 0,
        width: margin.left,
      }}
    >
      {ticksToShow.map((item) => (
        <BarValueYAxisLabel
          key={item.value}
          label={item.label}
          y={item.y}
        />
      ))}
    </div>,
    container
  );
});

BarValueYAxis.displayName = "BarValueYAxis";

export default BarValueYAxis;
