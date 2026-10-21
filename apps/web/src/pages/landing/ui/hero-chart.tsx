import {
  Chart,
  areaY,
  chartBase,
  colors,
  curves,
  defineChart,
  fadeGradient,
  lineY,
  scaleLinear,
} from "@harmony/charts/v4";
import { cn } from "@harmony/ui/lib/utils";

import { HERO_CHART_DATA } from "./mock-data";

// Pure decoration: no guides, no focus, no tooltip.
const HERO = defineChart({
  ...chartBase,
  marks: [
    areaY(HERO_CHART_DATA, {
      id: "area",
      x: "i",
      y: "value",
      fill: "url(#hero-fade)",
      curve: curves.monotone,
    }),
    lineY(HERO_CHART_DATA, {
      id: "line",
      x: "i",
      y: "value",
      stroke: colors.primary,
      strokeWidth: 2,
      curve: curves.monotone,
    }),
  ],
  scales: { x: { scale: scaleLinear }, y: { scale: scaleLinear, nice: true } },
  gradients: [fadeGradient("hero-fade", colors.primary)],
  guides: false,
  margin: 0,
  pointer: false,
  keyboard: false,
  focusRing: false,
});

/** Decorative listening-trend chart + center fade + glow. */
export const HeroChart = () => {
  return (
    <div className="relative size-full overflow-visible">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-visible">
        <div className="absolute top-1/2 left-1/2 h-[160%] w-[min(100%,52rem)] animate-glow-pulse rounded-full bg-[radial-gradient(ellipse_at_center,var(--primary)_0%,color-mix(in_oklab,var(--primary)_35%,transparent)_42%,transparent_72%)] blur-3xl motion-reduce:animate-none!" />
      </div>
      <div
        className={cn(
          "relative z-10 size-full",
          "mask-radial-from-20% mask-radial-to-80% mask-circle mask-radial-farthest-side mask-radial-at-top",
        )}
      >
        <Chart definition={HERO} ariaLabel="Listening trend" className="z-10 h-full" />
      </div>
    </div>
  );
};
