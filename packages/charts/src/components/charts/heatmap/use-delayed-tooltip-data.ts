"use client";

import { useEffect, useState } from "react";

import type { HeatmapTooltipData } from "./heatmap-context";

export function useDelayedTooltipData(
  tooltipData: HeatmapTooltipData | null,
  showDelay: number,
  hideDelay: number,
): HeatmapTooltipData | null {
  const [shown, setShown] = useState(false);
  const [lastData, setLastData] = useState<HeatmapTooltipData | null>(null);

  // Keep the last hovered cell so it stays visible during the hide delay.
  if (tooltipData && tooltipData !== lastData) {
    setLastData(tooltipData);
  }

  const wantShown = tooltipData !== null;
  const immediate = wantShown ? showDelay === 0 : hideDelay === 0;
  if (immediate && shown !== wantShown) {
    setShown(wantShown);
  }

  // `tooltipData` restarts a pending show delay while the pointer keeps moving.
  // biome-ignore lint/correctness/useExhaustiveDependencies: tooltipData
  useEffect(() => {
    if (immediate || shown === wantShown) {
      return;
    }
    const timer = setTimeout(() => setShown(wantShown), wantShown ? showDelay : hideDelay);
    return () => clearTimeout(timer);
  }, [tooltipData, wantShown, shown, immediate, showDelay, hideDelay]);

  const visible = immediate ? wantShown : shown;
  return visible ? (tooltipData ?? lastData) : null;
}
