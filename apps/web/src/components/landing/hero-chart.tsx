import { Area, AreaChart } from "@harmony/charts/v2";
import { cn } from "@harmony/ui/lib/utils";

import { HERO_CHART_DATA } from "./mock-data";

/** Decorative listening-trend chart via charts/v2 + center fade + glow. */
export function HeroChart() {
  return (
    <div className="relative size-full overflow-visible">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-visible">
        <div className="absolute top-1/2 left-1/2 h-[160%] w-[min(110%,52rem)] animate-glow-pulse rounded-full bg-[radial-gradient(ellipse_at_center,var(--primary)_0%,color-mix(in_oklab,var(--primary)_35%,transparent)_42%,transparent_72%)] blur-3xl motion-reduce:animate-none!" />
      </div>
      <div
        className={cn(
          "relative z-10 size-full",
          "mask-radial-from-20% mask-radial-to-80% mask-circle mask-radial-farthest-side mask-radial-at-top",
        )}
      >
        <AreaChart data={[...HERO_CHART_DATA]} xDataKey="i" className="z-10 !aspect-auto h-full">
          <Area dataKey="value" fill="var(--chart-3)" fillPattern="dots" />
        </AreaChart>
      </div>
    </div>
  );
}
