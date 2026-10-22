import {
  Chart,
  IntensityLegend,
  cell,
  chartBase,
  defineChart,
  edgeTickLabels,
  intensityColor,
  intensityLevel,
  pointTooltip,
  polar,
  polarBase,
  quietAxis,
  radialBarRadius,
  scaleBand,
  scaleLinear,
} from "@harmony/charts/v4";
import { Card } from "@harmony/ui/components/card";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { Rhythm } from "@/data/listening/types";

import { FigureViews } from "@/features/data-figure";
import { measure } from "@/shared/lib/measure";
import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";
import { format } from "@/utils/format";

import { listeningQueries } from "./api";
import { SectionPending } from "./ui/section-pending";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = DAYS.map((day) => day.slice(0, 3));
const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;
const HOURS = Array.from({ length: 24 }, (_, hour) => hourLabel(hour));
// Every third hour is labelled on the heatmap axis.
const HOUR_TICKS = HOURS.filter((_, hour) => hour % 3 === 0);

const VIEWS = [
  { value: "clock", label: "Clock" },
  { value: "heatmap", label: "Heatmap" },
];

// Tonal greens: the busiest bar, then the group that carries the listening, then the rest.
const PEAK = "var(--chart-1)";
const MAIN = "var(--chart-2)";
const DIM = "var(--chart-4)";

// Inner radius of the dial, as a share of its outer radius.
const INNER = 0.5;
// Quiet hours keep a stub of this share of the busiest one, so the dial stays whole.
const STUB = 0.04;
// Height of the tallest weekday bar, in pixels.
const BAR_HEIGHT = 112;

const DIAL_LABELS = [
  { text: "00", className: "top-0 left-1/2 -translate-x-1/2" },
  { text: "06", className: "top-1/2 right-0 -translate-y-1/2" },
  { text: "12", className: "bottom-0 left-1/2 -translate-x-1/2" },
  { text: "18", className: "top-1/2 left-0 -translate-y-1/2" },
];

// Parts of the day, by their first hour.
const PARTS = [
  { label: "Night", phrase: "at night", from: 0 },
  { label: "Morning", phrase: "in the morning", from: 6 },
  { label: "Afternoon", phrase: "in the afternoon", from: 12 },
  { label: "Evening", phrase: "in the evening", from: 18 },
];

type Part = (typeof PARTS)[number] & { share: number };

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const peakOf = (values: number[]): number =>
  values.reduce((best, value, i) => (value > (values[best] ?? 0) ? i : best), 0);

// The part of the day with the most listening, and its share.
const peakPart = (hours: number[]): Part => {
  const total = sum(hours);
  const parts = PARTS.map((part) => ({
    ...part,
    share: total > 0 ? sum(hours.slice(part.from, part.from + 6)) / total : 0,
  }));
  return parts.reduce((best, part) => (part.share > best.share ? part : best));
};

// How much busier an average weekend day is than an average weekday, negative when quieter.
const weekendLift = (days: number[]): number | null => {
  const weekday = sum(days.slice(0, 5)) / 5;
  const weekend = sum(days.slice(5)) / 2;
  return weekday > 0 ? (weekend - weekday) / weekday : null;
};

// Time on a bar label, where room is short: "12 h 36", "142 h", "45 min".
const shortTime = (minutes: number): string => {
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return hours >= 100 || rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
};

type Cell = { day: string; hour: string; value: number };

// Minutes by weekday and hour, brighter where you listen most.
const Heatmap = ({ grid }: { grid: number[][] }) => {
  const definition = useMemo(() => {
    const cells = grid.flatMap((hours, d) =>
      hours.map((value, h): Cell => ({ day: SHORT_DAYS[d] ?? "", hour: HOURS[h] ?? "", value })),
    );
    const max = Math.max(0, ...cells.map((c) => c.value));
    return defineChart({
      ...chartBase,
      marks: [
        cell(cells, {
          id: "cells",
          x: "hour",
          y: "day",
          color: (c) => intensityLevel(c.value, max),
          inset: 1,
          radius: 2,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand<string>().padding(0),
          axis: {
            ...quietAxis(cells.length > 0 ? { values: HOUR_TICKS } : {}),
            tickLabels: edgeTickLabels(HOURS, 0),
          },
        },
        y: { scale: () => scaleBand<string>().padding(0), axis: quietAxis() },
      },
      color: intensityColor,
      margin: { left: 32, right: 0, top: 0, bottom: 20 },
      focusRing: false,
      tooltip: pointTooltip((c: Cell) => ({
        title: `${c.day} ${c.hour}`,
        label: measure.playtime.label,
        value: format.as(c.value, "minutes"),
      })),
    });
  }, [grid]);

  return (
    <div className="flex flex-col gap-2">
      <Chart definition={definition} ariaLabel="Listening time by weekday and hour" height={200} />
      <IntensityLegend className="self-end" />
    </div>
  );
};

type HourBar = { hour: string; value: number; shown: number; fill: string };

// Listening by hour on a 24-hour dial, midnight on top and noon at the bottom.
const HourClock = ({ hours, part }: { hours: number[]; part: Part }) => {
  const peak = peakOf(hours);
  const total = sum(hours);

  const definition = useMemo(() => {
    const max = Math.max(0, ...hours);
    const bars = hours.map((value, index): HourBar => ({
      hour: HOURS[index] ?? "",
      value,
      shown: Math.max(value, max * STUB),
      fill: index === peak ? PEAK : index >= part.from && index < part.from + 6 ? MAIN : DIM,
    }));
    return defineChart({
      ...polarBase,
      marks: [
        polar({
          radiusRatio: 0.86,
          scales: {
            angle: { scale: () => scaleBand<string>().padding(0.15) },
            radius: {
              scale: scaleLinear().domain([0, max || 1]),
              range: [({ radius }) => radius * INNER, ({ radius }) => radius],
            },
          },
          marks: [
            radialBarRadius(bars, {
              id: "hours",
              key: "hour",
              angle: "hour",
              radius: "shown",
              radius1: 0,
              fill: (bar) => bar.fill,
              cornerRadius: 1.5,
              states: [{ when: { focus: "unmatched" }, style: { opacity: 0.5 } }],
            }),
          ],
        }),
      ],
      tooltip: pointTooltip((bar: HourBar) => ({
        title: bar.hour,
        label: measure.playtime.label,
        value: format.as(bar.value, "minutes"),
      })),
    });
  }, [hours, part, peak]);

  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-72">
        <Chart
          definition={definition}
          ariaLabel="Listening time by hour of the day"
          aspectRatio={1}
        />
        {DIAL_LABELS.map((label) => (
          <span
            key={label.text}
            aria-hidden
            className={cn(
              "pointer-events-none absolute text-[10px] text-muted-foreground tabular-nums",
              label.className,
            )}
          >
            {label.text}
          </span>
        ))}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums">
            {total > 0 ? HOURS[peak] : "-"}
          </span>
          <span className="text-[10px] text-muted-foreground">busiest hour</span>
        </div>
      </div>
      <figcaption className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span aria-hidden className="h-0.5 w-3 rounded-full bg-chart-2" />
        {part.label} · {format.as(part.share, "percent")}
      </figcaption>
    </figure>
  );
};

// Listening by day of the week, with the weekday average against the weekend.
const WeekdayBars = ({ days }: { days: number[] }) => {
  const max = Math.max(0, ...days);
  const busiest = peakOf(days);
  const weekday = sum(days.slice(0, 5)) / 5;
  const lift = weekendLift(days);
  const tone = (i: number) => (i === busiest ? PEAK : i < 5 ? MAIN : DIM);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">By day of week</figcaption>
      <div className="mt-auto grid grid-cols-7 items-end gap-2">
        {days.map((value, i) => (
          <div
            key={DAYS[i]}
            className="flex flex-col items-center gap-1"
            title={`${DAYS[i]}: ${format.as(value, "minutes")}`}
          >
            <span
              className={cn(
                "text-[10px] whitespace-nowrap text-muted-foreground tabular-nums",
                i === busiest && "font-medium text-foreground",
              )}
            >
              {shortTime(value)}
            </span>
            <span
              aria-hidden
              className="w-full rounded-t-sm"
              style={{
                height: Math.max(max > 0 ? (value / max) * BAR_HEIGHT : 0, 2),
                backgroundColor: tone(i),
              }}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
        {SHORT_DAYS.map((day, i) => (
          <span key={day} className={cn(i === busiest && "font-medium text-foreground")}>
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-muted-foreground tabular-nums">
        <div className="col-span-5 flex flex-col gap-1">
          <span aria-hidden className="h-1.5 border-x border-b border-border" />
          <span>
            Weekday avg{" "}
            <strong className="font-medium text-foreground">{format.as(weekday, "minutes")}</strong>
          </span>
        </div>
        <div className="col-span-2 flex flex-col gap-1" title="A weekend day against a weekday">
          <span aria-hidden className="h-1.5 border-x border-b border-border" />
          <strong className="font-medium text-foreground">
            {lift === null ? "-" : `${lift < 0 ? "−" : "+"}${format.as(Math.abs(lift), "percent")}`}
          </strong>
        </div>
      </div>
    </figure>
  );
};

type FactProps = { label: string; value: string; hint: string };

const Fact = ({ label, value, hint }: FactProps) => (
  <div className="flex flex-col gap-0.5 px-4 py-3">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="text-sm font-semibold tabular-nums">{value}</dd>
    <dd className="text-xs text-muted-foreground tabular-nums">{hint}</dd>
  </div>
);

const NO_RHYTHM: Rhythm = { grid: [], days: [], hours: [] };

// Which hours of the day and which days of the week carry the listening.
export const RhythmWidget = () => {
  const filter = useScope();
  const { data = NO_RHYTHM, isPending } = useQuery(listeningQueries.rhythm.queryOptions(filter));
  const [view, setView] = useState("clock");

  const total = sum(data.hours);
  const day = peakOf(data.days);
  const hour = peakOf(data.hours);
  // Between midnight and 6 am.
  const night = total > 0 ? sum(data.hours.slice(0, 6)) / total : 0;
  const part = useMemo(() => peakPart(data.hours), [data.hours]);
  const lift = weekendLift(data.days);

  if (isPending) {
    return (
      <SectionPending title="Rhythm">
        <Skeleton className="h-118 rounded-lg" />
      </SectionPending>
    );
  }

  return (
    <Section size="md">
      <Section.Title>Rhythm</Section.Title>
      <Section.Text>
        {total > 0 ? (
          <>
            You listen most <strong>{part.phrase}</strong>, with{" "}
            <strong>{format.as(part.share, "percent")}</strong> of your time.
            {lift !== null && Math.abs(lift) >= 0.05 ? (
              <>
                {" "}
                A weekend day is <strong>{format.as(Math.abs(lift), "percent")}</strong>{" "}
                {lift > 0 ? "busier" : "quieter"} than a weekday.
              </>
            ) : null}
          </>
        ) : (
          "No listening in this period."
        )}
      </Section.Text>
      <Card size="xs" className="mt-3 gap-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <h3 className="text-xs font-medium">Listening time, in your time zone</h3>
          <FigureViews views={VIEWS} value={view} onChange={setView} />
        </div>
        {view === "clock" ? (
          <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-4">
              <HourClock hours={data.hours} part={part} />
            </div>
            <div className="flex p-4 *:flex-1">
              <WeekdayBars days={data.days} />
            </div>
          </div>
        ) : (
          <div className="p-4">
            <Heatmap grid={data.grid} />
          </div>
        )}
        <dl className="grid grid-cols-3 divide-x border-t">
          <Fact
            label="Biggest day"
            value={total > 0 ? (DAYS[day] ?? "-") : "-"}
            hint={format.as(data.days[day] ?? 0, "minutes")}
          />
          <Fact
            label="Busiest hour"
            value={total > 0 ? (HOURS[hour] ?? "-") : "-"}
            hint={format.as(data.hours[hour] ?? 0, "minutes")}
          />
          <Fact label="After midnight" value={format.as(night, "percent")} hint="00:00 – 06:00" />
        </dl>
      </Card>
    </Section>
  );
};
