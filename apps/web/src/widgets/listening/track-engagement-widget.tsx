import {
  Chart,
  areaY,
  chartBase,
  colors,
  decorative,
  defineChart,
  dot,
  pointTooltip,
  scaleLinear,
  text,
} from "@harmony/charts/v4";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { TrackEngagementStage } from "@/data/listening/types";

import { format } from "@/utils/format";

import { listeningQueries } from "./api";

// Gap between two stages, in stage widths, and the narrowing after the last one.
const INSET = 0.02;
const LAST_RATIO = 0.72;

type Stage = TrackEngagementStage & { x: number; share: number };

// Stages left to right, each a trapezoid narrowing from its value to the next one.
const funnelLayout = (stages: readonly TrackEngagementStage[]) => {
  const first = stages[0]?.value || 1;
  const centers = stages.map((stage, i): Stage => ({
    ...stage,
    x: i + 0.5,
    share: stage.value / first,
  }));
  const edges = stages.flatMap((stage, i) => {
    const next = stages[i + 1]?.value ?? stage.value * LAST_RATIO;
    return [
      {
        label: stage.label,
        edge: "start",
        x: i + INSET,
        y1: -stage.value / 2,
        y2: stage.value / 2,
      },
      { label: stage.label, edge: "end", x: i + 1 - INSET, y1: -next / 2, y2: next / 2 },
    ];
  });
  return { centers, edges, max: Math.max(1, ...stages.map((stage) => stage.value)) };
};

export const TrackEngagementWidget = () => {
  const { data } = useQuery(listeningQueries.trackEngagement.queryOptions());

  const definition = useMemo(() => {
    const stages = data ?? [];
    const { centers, edges, max } = funnelLayout(stages);

    return defineChart({
      ...chartBase,
      marks: [
        decorative(
          areaY(edges, {
            id: "stages",
            x: "x",
            y1: "y1",
            y2: "y2",
            z: "label",
            color: "label",
            key: (edge) => `${edge.label}:${edge.edge}`,
            fillOpacity: 1,
          }),
        ),
        decorative(
          text(centers, {
            id: "values",
            x: "x",
            y: () => 0,
            text: (stage) => format.as(stage.value, "compact"),
            dy: -6,
            fontSize: 13,
            fontWeight: 600,
          }),
        ),
        decorative(
          text(centers, {
            id: "names",
            x: "x",
            y: () => 0,
            text: "label",
            dy: 10,
            fontSize: 10,
            fill: colors.muted,
          }),
        ),
        // invisible anchor of each stage, for focus and the tooltip
        dot(centers, { id: "anchors", x: "x", y: () => 0, r: 0, key: "label" }),
      ],
      scales: {
        x: { scale: scaleLinear().domain([0, Math.max(1, stages.length)]) },
        y: { scale: scaleLinear().domain([-max / 2, max / 2]) },
      },
      color: {
        domain: stages.map((stage) => stage.label),
        range: stages.map((_, i) => colors.tiers[i % colors.tiers.length] ?? colors.primary),
      },
      guides: false,
      margin: 0,
      focus: "nearest-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: pointTooltip((stage: Stage) => ({
        title: stage.label,
        label: "Tracks",
        value: `${format.count(stage.value)} · ${format.as(stage.share, "percent")}`,
      })),
    });
  }, [data]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Track Engagement</span>
      </div>
      <Chart definition={definition} ariaLabel="Tracks by number of plays" aspectRatio={4} />
    </div>
  );
};
