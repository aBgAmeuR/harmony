import type { ChartDefinition } from "@tanstack/charts/react";

import { cn } from "@harmony/ui/lib/utils";
import { Chart } from "@tanstack/charts/react";

import { tooltipStyle } from "./theme";
import { toLabel } from "./types";

type SurfaceProps<TDatum, TX extends string | number | Date, TY extends string | number | Date> = {
  definition: ChartDefinition<TDatum, TX, TY>;
  ariaLabel: string;
  // Fixed height in px. Without it the chart keeps `aspectRatio`, or the library default.
  height?: number;
  aspectRatio?: number;
  className?: string;
  // Called with the x category of the clicked point or bar.
  onSelectX?: (x: string) => void;
};

// The one place that renders a TanStack chart: inherits the Harmony font, text color and tooltip.
export const ChartSurface = <
  TDatum,
  TX extends string | number | Date,
  TY extends string | number | Date,
>({
  definition,
  ariaLabel,
  height,
  aspectRatio,
  className,
  onSelectX,
}: SurfaceProps<TDatum, TX, TY>) => (
  <Chart
    definition={definition}
    ariaLabel={ariaLabel}
    height={height}
    aspectRatio={aspectRatio}
    className={cn("text-xs text-foreground", className)}
    style={tooltipStyle}
    onSelect={onSelectX ? (point) => point && onSelectX(toLabel(point.xValue)) : undefined}
  />
);
