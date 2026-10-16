import type { ChartDefinition } from "@tanstack/charts/react";

import { cn } from "@harmony/ui/lib/utils";
import { Chart } from "@tanstack/charts/react";

import { tooltipStyle } from "./theme";

type SurfaceProps<TDatum, TX extends string | number | Date, TY extends string | number | Date> = {
  definition: ChartDefinition<TDatum, TX, TY>;
  ariaLabel: string;
  // Fixed height in px. Without it the chart keeps `aspectRatio`, or the library default.
  height?: number;
  aspectRatio?: number;
  className?: string;
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
}: SurfaceProps<TDatum, TX, TY>) => (
  <Chart
    definition={definition}
    ariaLabel={ariaLabel}
    height={height}
    aspectRatio={aspectRatio}
    className={cn("text-xs text-foreground", className)}
    style={tooltipStyle}
  />
);
