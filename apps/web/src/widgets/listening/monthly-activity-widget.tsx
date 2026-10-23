import {
  Chart,
  areaY,
  chartBase,
  colors,
  columnGuide,
  columnTooltip,
  curves,
  decorative,
  defineChart,
  dot,
  fadeGradient,
  gridDown,
  lineY,
  quietAxis,
  ruleY,
  scaleLinear,
  scalePoint,
  seriesColor,
  type Series,
} from "@harmony/charts/v4";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, type ReactNode } from "react";

import type { OverTimePoint, OverTimeUnit } from "@/data/listening/types";

import { overTimeUnitFor } from "@/data/listening/over-time";
import { FigureViews } from "@/features/data-figure";
import { measure } from "@/shared/lib/measure";
import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";
import { format } from "@/utils/format";

import { listeningQueries } from "./api";
import { SectionPending } from "./ui/section-pending";

const UNITS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const isUnit = (value: string): value is OverTimeUnit =>
  value === "day" || value === "week" || value === "month";

const WORDS: Record<OverTimeUnit, { noun: string; plural: string; adjective: string; on: string }> =
  {
    day: { noun: "day", plural: "days", adjective: "daily", on: "on" },
    week: { noun: "week", plural: "weeks", adjective: "weekly", on: "in" },
    month: { noun: "month", plural: "months", adjective: "monthly", on: "in" },
  };

const LINE = "var(--chart-1)";
// Above this many buckets, dots would crowd the line.
const MAX_DOTS = 36;
// Most labels the axis shows.
const MAX_TICKS = 12;
// Room above the peak for its badge.
const HEADROOM = 1.3;

const time = (minutes: number) => format.as(minutes, "minutes");

const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const longMonth = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

type Bucket = {
  // Axis label, unique in the period.
  name: string;
  // Name in a sentence: "July", "the week of Mar 3", "Mar 3".
  long: string;
  value: number;
  // False after the newest play of the package: no data there yet.
  covered: boolean;
  series: "time";
};

// A period over several calendar years adds the year to the names, so they stay unique.
const toBuckets = (
  points: OverTimePoint[],
  last: string | null,
  unit: OverTimeUnit,
  years: boolean,
): Bucket[] =>
  points.map((point) => {
    const date = new Date(`${point.start}T00:00:00Z`);
    const year = years ? ` ${date.getUTCFullYear()}` : "";
    const day = `${monthDay.format(date)}${year}`;
    return {
      name: unit === "month" ? `${shortMonth.format(date)}${year}` : day,
      long:
        unit === "month"
          ? `${longMonth.format(date)}${year}`
          : unit === "week"
            ? `the week of ${day}`
            : day,
      value: point.value,
      covered: last === null || point.start <= last,
      series: "time",
    };
  });

const summarize = (buckets: Bucket[]) => {
  const covered = buckets.filter((bucket) => bucket.covered);
  const active = covered.filter((bucket) => bucket.value > 0);
  const peak = active.reduce<Bucket | undefined>(
    (best, bucket) => (bucket.value > (best?.value ?? 0) ? bucket : best),
    undefined,
  );
  const quietest = active.reduce<Bucket | undefined>(
    (low, bucket) => (bucket.value < (low?.value ?? Infinity) ? bucket : low),
    undefined,
  );
  const average =
    covered.length > 0 ? covered.reduce((sum, b) => sum + b.value, 0) / covered.length : 0;
  return { covered, active, peak, quietest, average };
};

type Spot = { left: number; top: number };

// Moves an overlay onto the chart, or hides it when it has no place there.
const place = (element: HTMLElement | null, spot: Spot | null) => {
  if (!element) return;
  element.style.visibility = spot ? "visible" : "hidden";
  if (!spot) return;
  element.style.left = `${spot.left}px`;
  element.style.top = `${spot.top}px`;
};

type OverTimeChartProps = {
  buckets: Bucket[];
  covered: Bucket[];
  peak?: Bucket;
  average: number;
  ariaLabel: string;
};

// An area over the period with its average and its peak. Buckets without data yet are hatched.
const OverTimeChart = ({ buckets, covered, peak, average, ariaLabel }: OverTimeChartProps) => {
  const badge = useRef<HTMLDivElement>(null);
  const mean = useRef<HTMLSpanElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const lastCovered = covered.at(-1);
  const firstFuture = buckets.find((bucket) => !bucket.covered);

  const definition = useMemo(() => {
    const names = buckets.map((bucket) => bucket.name);
    const future = new Set(buckets.filter((b) => !b.covered).map((b) => b.name));
    const every = Math.ceil(names.length / MAX_TICKS);
    const series: Series = {
      time: { label: measure.playtime.label, color: LINE, format: time },
    };

    return defineChart({
      ...chartBase,
      color: seriesColor(series),
      ...columnTooltip(series),
      marks: [
        decorative(
          areaY(covered, {
            id: "area",
            x: "name",
            y: "value",
            fill: "url(#over-time-fade)",
            curve: curves.monotone,
          }),
        ),
        ...(average > 0
          ? [
              decorative(
                ruleY([average], {
                  id: "average",
                  stroke: colors.muted,
                  strokeDasharray: "4 4",
                  strokeOpacity: 0.6,
                }),
              ),
            ]
          : []),
        lineY(covered, {
          id: "line",
          x: "name",
          y: "value",
          z: "series",
          curve: curves.monotone,
          strokeWidth: 2,
        }),
        ...(covered.length <= MAX_DOTS
          ? [
              decorative(
                dot(covered, {
                  id: "dots",
                  x: "name",
                  y: "value",
                  r: 3,
                  fill: "var(--background)",
                  stroke: LINE,
                  strokeWidth: 1.5,
                }),
              ),
            ]
          : []),
        columnGuide(),
      ],
      scales: {
        x: {
          scale: scalePoint<string>().domain(names).padding(0.5),
          axis: {
            ...quietAxis(
              names.length > 0 ? { values: names.filter((_, i) => i % every === 0) } : {},
            ),
            tickLabels: {
              fontWeight: ({ value }) => (value === peak?.name ? 600 : undefined),
              opacity: ({ value }) => (future.has(value) ? 0.4 : undefined),
            },
          },
        },
        y: {
          scale: scaleLinear().domain([0, Math.max(peak?.value ?? 0, average) * HEADROOM || 1]),
          grid: gridDown,
          // Three grid lines, without labels.
          axis: { ...quietAxis<number>({ count: 3 }), tickLabels: false },
        },
      },
      gradients: [fadeGradient("over-time-fade", LINE)],
    });
  }, [buckets, covered, peak, average]);

  // The overlays come first and stay mounted, so their refs are set when the chart draws.
  return (
    <div className="relative">
      <div
        ref={zone}
        aria-hidden
        className="pointer-events-none invisible absolute z-10 border-l border-dashed border-border bg-[repeating-linear-gradient(135deg,var(--color-border)_0_1px,transparent_1px_6px)]"
      >
        <span className="absolute top-1 left-2 text-[10px] text-muted-foreground">Not yet</span>
      </div>
      <span
        ref={mean}
        aria-hidden
        className="pointer-events-none invisible absolute z-10 mt-[-2px] -translate-y-full rounded-sm bg-background/80 px-1 text-[10px] text-muted-foreground tabular-nums"
      >
        Avg {time(average)}
      </span>
      <div
        ref={badge}
        aria-hidden
        className="pointer-events-none invisible absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border bg-popover px-1.5 py-0.5 text-[10px] whitespace-nowrap text-muted-foreground tabular-nums"
      >
        <span className="font-medium text-foreground">{time(peak?.value ?? 0)}</span> peak
      </div>
      <Chart
        definition={definition}
        ariaLabel={ariaLabel}
        aspectRatio={3.2}
        onRender={({ scene }) => {
          const { x, y } = scene.scales;
          const plot = scene.chart;
          if (!x || !y) return;
          place(badge.current, peak ? { left: x.map(peak.name), top: y.map(peak.value) } : null);
          place(mean.current, average > 0 ? { left: plot.x, top: y.map(average) } : null);
          const start = firstFuture
            ? lastCovered
              ? (x.map(lastCovered.name) + x.map(firstFuture.name)) / 2
              : plot.x
            : null;
          if (zone.current && start !== null) {
            zone.current.style.width = `${Math.max(plot.x + plot.width - start, 0)}px`;
            zone.current.style.height = `${plot.height}px`;
          }
          place(zone.current, start !== null ? { left: start, top: plot.y } : null);
        }}
      />
    </div>
  );
};

const Chip = ({ label, children }: { label: string; children: ReactNode }) => (
  <li className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium tabular-nums">{children}</span>
  </li>
);

const NO_POINTS: OverTimePoint[] = [];

// Listening time across the period, by day, week or month.
export const MonthlyActivityWidget = () => {
  const filter = useScope();
  // The period picks the unit until the listener picks one.
  const [picked, setPicked] = useState<OverTimeUnit | null>(null);
  const unit = picked ?? overTimeUnitFor(filter.from, filter.to);
  const { data } = useQuery({
    ...listeningQueries.overTime.queryOptions(filter, unit),
    // The previous unit stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });

  // Words follow the data on screen, which lags the picked unit while it loads.
  const shown = data?.unit ?? unit;
  const words = WORDS[shown];
  const years = filter.from.getFullYear() !== filter.to.getFullYear();
  const buckets = useMemo(
    () => toBuckets(data?.points ?? NO_POINTS, data?.last ?? null, shown, years),
    [data, shown, years],
  );
  const { covered, active, peak, quietest, average } = useMemo(() => summarize(buckets), [buckets]);
  const above = peak && average > 0 ? peak.value / average - 1 : 0;

  if (!data) {
    return (
      <SectionPending title="Over time">
        <Skeleton className="aspect-[3.2] rounded-lg" />
        <Skeleton className="h-7 w-96 max-w-full rounded-full" />
      </SectionPending>
    );
  }

  return (
    <Section size="md">
      <Section.Title>Over time</Section.Title>
      <div className="flex items-start justify-between gap-4">
        <Section.Text>
          {peak ? (
            <>
              Your listening peaked {words.on} <strong>{peak.long}</strong> at{" "}
              <strong>{time(peak.value)}</strong>
              {above >= 0.01 ? (
                <>
                  , {format.as(above, "percent")} above your {words.adjective} average of{" "}
                  <strong>{time(average)}</strong>
                </>
              ) : null}
              .
            </>
          ) : (
            "No listening in this period."
          )}
        </Section.Text>
        <FigureViews
          views={UNITS}
          value={unit}
          onChange={(next) => {
            if (isUnit(next)) setPicked(next);
          }}
        />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <OverTimeChart
          buckets={buckets}
          covered={covered}
          peak={peak}
          average={average}
          ariaLabel={`${measure.playtime.label} by ${words.noun}`}
        />
        <ul className="flex flex-wrap gap-2">
          <Chip label={`Best ${words.noun}`}>
            {peak ? `${peak.name} · ${time(peak.value)}` : "-"}
          </Chip>
          <Chip label="Quietest">
            {quietest ? `${quietest.name} · ${time(quietest.value)}` : "-"}
          </Chip>
          <Chip label={`Active ${words.plural}`}>
            {active.length} of {covered.length}
          </Chip>
        </ul>
      </div>
    </Section>
  );
};
