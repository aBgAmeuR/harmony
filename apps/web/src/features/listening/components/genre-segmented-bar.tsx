import { defaultPieColors } from "@harmony/charts";
import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";
import { useState } from "react";

import type { GenreSegment } from "../types";

function segmentColor(index: number): string {
  return defaultPieColors[index % defaultPieColors.length] ?? "var(--chart-1)";
}

type GenreSegmentedBarProps = {
  segments: GenreSegment[];
};

export function GenreSegmentedBar({ segments }: GenreSegmentedBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-end gap-0.5">
        {segments.map((segment, index) => {
          const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

          return (
            <div
              className="flex min-w-0 flex-col"
              key={segment.key}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ flex: `${segment.percentage} 1 0%` }}
            >
              <div className="mb-1 flex flex-col items-start">
                <span
                  className={cn(
                    "text-xs tabular-nums transition-opacity",
                    isDimmed ? "text-muted-foreground/40" : "text-muted-foreground",
                  )}
                >
                  {segment.percentage}%
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 block h-3 w-px transition-opacity",
                    isDimmed ? "bg-border/40" : "bg-muted",
                  )}
                />
              </div>

              <div
                className={cn("h-6 w-full rounded-lg transition-opacity", isDimmed && "opacity-40")}
                style={{ backgroundColor: segmentColor(index) }}
              />
            </div>
          );
        })}
      </div>

      <div className="-ml-2.5 flex flex-wrap gap-y-1">
        {segments.map((segment, index) => {
          const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

          return (
            <Button
              variant="ghost"
              size="lg"
              className={cn(isDimmed ? "opacity-40" : "opacity-100")}
              key={segment.key}
              onBlur={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ backgroundColor: segmentColor(index) }}
              />
              {segment.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
