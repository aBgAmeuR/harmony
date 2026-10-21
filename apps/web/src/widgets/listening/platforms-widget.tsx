import {
  Chart,
  colors,
  defineChart,
  pie,
  pointTooltip,
  polar,
  polarBase,
  radialArc,
  type PieDatum,
} from "@harmony/charts/v4";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";

import type { PlatformPoint } from "@/data/listening/types";

import { format } from "@/utils/format";

import { listeningQueries } from "./api";

const NO_PLATFORMS: PlatformPoint[] = [];
const minutes = (value: number) => format.as(value, "minutes");

export const PlatformsWidget = () => {
  const { data = NO_PLATFORMS } = useQuery(listeningQueries.platforms.queryOptions());
  // The legend and the donut highlight the same platform, whichever is hovered.
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = useRef<(label: string | null) => void>(() => {});

  const tierOf = (index: number) => colors.tiers[index % colors.tiers.length] ?? colors.primary;

  const definition = useMemo(
    () =>
      defineChart({
        ...polarBase,
        marks: [
          polar({
            radiusRatio: 0.9,
            scales: { angle: null, radius: null },
            marks: [
              radialArc(pie(data, { value: "value", gapAngle: 0.02 }), {
                id: "slices",
                key: "label",
                color: "label",
                innerRadius: ({ radius }) => radius * 0.68,
                cornerRadius: 3,
                states: [{ when: { focus: "unmatched" }, style: { opacity: 0.35 } }],
              }),
            ],
          }),
        ],
        color: {
          domain: data.map((platform) => platform.label),
          range: data.map((_, i) => tierOf(i)),
        },
        tooltip: pointTooltip((slice: PieDatum<PlatformPoint>) => ({
          title: slice.label,
          label: "Time listened",
          value: minutes(slice.value),
        })),
      }),
    [data],
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Platforms</span>
      </div>
      <div className="flex items-center gap-8 px-2">
        <div className="relative w-1/2">
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Platforms
          </span>
          <Chart
            definition={definition}
            ariaLabel="Listening time by platform"
            aspectRatio={1}
            onFocusChange={(point) => setHovered(point?.datum.label ?? null)}
            onRender={({ scene, interaction }) => {
              focus.current = (label) =>
                interaction.setControlledFocus(
                  scene.points.find((point) => point.datum.label === label) ?? null,
                );
            }}
          />
        </div>
        <ul className="flex flex-1 flex-col gap-1">
          {data.map((platform, index) => (
            <li
              key={platform.label}
              className={cn(
                "flex items-center gap-3 text-xs transition-opacity",
                hovered !== null && hovered !== platform.label && "opacity-40",
              )}
              onMouseEnter={() => focus.current(platform.label)}
              onMouseLeave={() => focus.current(null)}
            >
              <span className="size-2.5 rounded-xs" style={{ backgroundColor: tierOf(index) }} />
              <span className="flex-1">{platform.label}</span>
              <span className="text-muted-foreground tabular-nums">{minutes(platform.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
