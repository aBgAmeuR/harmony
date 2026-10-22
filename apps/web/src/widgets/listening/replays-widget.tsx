import {
  Chart,
  areaY,
  chartBase,
  curves,
  decorative,
  defineChart,
  lineY,
  ruleX,
  scaleLinear,
} from "@harmony/charts/v4";
import { Icon, RepeatIcon } from "@harmony/icons";
import { Card } from "@harmony/ui/components/card";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { TrackEngagementStage } from "@/data/listening/types";

import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";
import { format, parts } from "@/utils/format";

import { listeningQueries } from "./api";
import { SectionPending } from "./ui/section-pending";

const NO_STAGES: TrackEngagementStage[] = [];

const LABELS = ["All", "2+ plays", "5+ plays", "20+ plays", "50+ plays"];

const LINE = "var(--chart-1)";

const tracks = (count: number) => `${format.count(count)} ${count === 1 ? "track" : "tracks"}`;

// Tracks still played at each play count, as steps: each count holds until the next one.
const StandingSteps = ({ stages }: { stages: TrackEngagementStage[] }) => {
  const columns = { gridTemplateColumns: `repeat(${Math.max(stages.length, 1)}, minmax(0, 1fr))` };

  const definition = useMemo(() => {
    const count = stages.length;
    const last = stages.at(-1);
    // The last count holds to the right edge.
    const points = [
      ...stages.map((stage, i) => ({ x: i, value: stage.value })),
      ...(last ? [{ x: count, value: last.value }] : []),
    ];
    const top = Math.max(0, ...stages.map((stage) => stage.value)) || 1;

    return defineChart({
      ...chartBase,
      guides: false,
      margin: { top: 2, right: 0, bottom: 1, left: 0 },
      marks: [
        decorative(
          ruleX(
            Array.from({ length: Math.max(count - 1, 0) }, (_, i) => i + 1),
            { id: "steps", stroke: "var(--foreground)", strokeOpacity: 0.07 },
          ),
        ),
        decorative(
          areaY(points, {
            id: "area",
            x: "x",
            y: "value",
            curve: curves.step,
            fill: LINE,
            fillOpacity: 0.25,
          }),
        ),
        decorative(
          lineY(points, {
            id: "line",
            x: "x",
            y: "value",
            curve: curves.step,
            stroke: LINE,
            strokeWidth: 2,
          }),
        ),
      ],
      scales: {
        x: { scale: scaleLinear().domain([0, Math.max(count, 1)]) },
        y: { scale: scaleLinear().domain([0, top * 1.02]) },
      },
    });
  }, [stages]);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">
        Tracks still standing at each play count
      </figcaption>
      <div className="grid" style={columns}>
        {stages.map((stage) => (
          <span key={stage.label} className="text-lg font-semibold tabular-nums">
            {format.count(stage.value)}
          </span>
        ))}
      </div>
      <Chart
        definition={definition}
        ariaLabel={stages.map((stage) => `${stage.label}: ${tracks(stage.value)}`).join(", ")}
        aspectRatio={3.4}
      />
      <div className="grid text-xs text-muted-foreground" style={columns}>
        {stages.map((stage) => (
          <span key={stage.label} className="truncate">
            {stage.label}
          </span>
        ))}
      </div>
    </figure>
  );
};

// How many tracks came back for a second, fifth, twentieth and fiftieth play.
export const ReplaysWidget = () => {
  const filter = useScope();
  const { data = NO_STAGES, isPending } = useQuery(
    listeningQueries.trackEngagement.queryOptions(filter),
  );

  // The same stages with the page's wording.
  const stages = useMemo(
    () => data.map((stage, i) => ({ ...stage, label: LABELS[i] ?? stage.label })),
    [data],
  );
  const unique = stages[0]?.value ?? 0;
  const twice = stages[1]?.value ?? 0;
  const favorites = stages[4]?.value ?? 0;
  const once = unique - twice;
  const rate = unique > 0 ? twice / unique : 0;

  if (isPending) {
    return (
      <SectionPending title="Replays">
        <Skeleton className="h-11 rounded-lg" />
        <Skeleton className="h-68 rounded-lg" />
      </SectionPending>
    );
  }

  return (
    <Section size="md">
      <Section.Title>Replays</Section.Title>
      <Section.Text>
        {unique > 0 ? (
          <>
            <strong>{format.count(twice)}</strong> of your <strong>{format.count(unique)}</strong>{" "}
            tracks got a second play, and <strong>{format.count(favorites)}</strong> passed 50
            plays.
          </>
        ) : (
          "No listening in this period."
        )}
      </Section.Text>
      {unique > 0 ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 text-sm">
          <Icon icon={RepeatIcon} className="shrink-0 text-primary" />
          <p className="text-pretty [&_strong]:font-semibold">
            {rate >= 0.75 ? "Only " : null}
            <strong>{tracks(once)}</strong> {once === 1 ? "was" : "were"} heard once and never
            again.{" "}
            {rate >= 0.75
              ? "Most of this catalogue is on repeat."
              : rate >= 0.4
                ? "You split your time between favorites and new finds."
                : "You mostly move on to new music."}
          </p>
        </div>
      ) : null}
      <Card
        size="xs"
        className="mt-3 grid gap-0 divide-y md:grid-cols-[2fr_5fr] md:divide-x md:divide-y-0"
      >
        <div className="flex flex-col justify-center gap-1.5 p-6">
          <span className="text-xs text-muted-foreground">Replay rate</span>
          <span className="flex items-baseline gap-0.5 tabular-nums">
            {unique > 0 ? (
              parts(rate, "percent").map((part) => (
                <span key={part.unit ?? "value"} className="inline-flex items-baseline gap-0.5">
                  <span className="text-5xl leading-none font-semibold tracking-tighter">
                    {part.value}
                  </span>
                  {part.unit ? <span className="text-2xl font-medium">{part.unit}</span> : null}
                </span>
              ))
            ) : (
              <span className="text-5xl leading-none font-semibold">-</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            of your tracks came back for a second play
          </span>
        </div>
        <div className="p-6">
          <StandingSteps stages={stages} />
        </div>
      </Card>
    </Section>
  );
};
