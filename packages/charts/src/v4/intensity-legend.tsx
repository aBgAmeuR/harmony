import { cn } from "@harmony/ui/lib/utils";

import { intensityLevels } from "./intensity";

type IntensityLegendProps = {
  className?: string;
};

// "Less ■■■■■ More" key of the intensity ramp, for heatmaps and value-colored bars.
export const IntensityLegend = ({ className }: IntensityLegendProps) => (
  <span className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
    Less
    {intensityLevels.map((color) => (
      <span key={color} className="size-2.5 rounded-xs" style={{ backgroundColor: color }} />
    ))}
    More
  </span>
);
