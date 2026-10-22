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
  fold,
  gridDown,
  lineY,
  seriesColor,
  xPoint,
  yValue,
  type Series,
} from "@harmony/charts/v4";
import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { Card } from "@harmony/ui/components/card";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";

import type { Overview, Totals } from "@/data/overview/kpis";
import type { Unit } from "@/data/overview/range";
import type { Kind } from "@/utils/format";

import { FigureViews } from "@/features/data-figure";
import { measure } from "@/shared/lib/measure";
import { Delta } from "@/shared/primitives/delta";
import { Empty } from "@/shared/primitives/empty";
import { Stat } from "@/shared/primitives/stat";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { delta, periodNames } from "./format";
import { useRanges } from "./use-range";

type Key = "minutes" | "streams" | "artists" | "days";

type MetricDef = {
  key: Key;
  label: string;
  kind: Kind;
  // One sentence under the chart.
  hint: (totals: Totals, days: number) => string;
  // Raw units in one chart unit: the chart plots minutes as hours, the tooltip formats raw values.
  unit: number;
  // The page that tells more, and the words of its link.
  to: "./listening" | "./artists" | "./milestones";
  more: string;
};

const metrics: MetricDef[] = [
  {
    key: "minutes",
    ...measure.playtime,
    hint: (t) => `That is ${(t.minutes / 1440).toFixed(1)} days of non-stop music.`,
    unit: 60,
    to: "./listening",
    more: "See your listening habits",
  },
  {
    key: "streams",
    ...measure.streams,
    hint: (t) => `${format.count(t.streams / Math.max(t.days, 1))} streams per active day.`,
    unit: 1,
    to: "./listening",
    more: "See your listening habits",
  },
  {
    key: "artists",
    ...measure.artists,
    hint: (t) => `Across ${format.count(t.tracks)} distinct tracks.`,
    unit: 1,
    to: "./artists",
    more: "Browse your artists",
  },
  {
    key: "days",
    ...measure.days,
    hint: (t, days) => `You listened on ${format.count(t.days)} of ${format.count(days)} days.`,
    unit: 1,
    to: "./milestones",
    more: "See your milestones",
  },
];

const UNITS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const isUnit = (value: string): value is Unit =>
  value === "day" || value === "week" || value === "month";

const CURRENT = "var(--chart-1)";
const PREVIOUS = "color-mix(in srgb, var(--muted-foreground) 55%, transparent)";

const peakIndex = (values: number[]): number =>
  values.reduce((best, value, i) => (value > (values[best] ?? 0) ? i : best), 0);

type KpiChartProps = {
  data: Overview;
  def: MetricDef;
  names: { current: string; previous: string };
};

// The period as an area, the one before as a dashed line, and the peak marked.
const buildChart = ({ data, def, names }: KpiChartProps) => {
  const wide = data.labels.map((label, i) => ({
    label,
    current: (data.current.series[def.key][i] ?? 0) / def.unit,
    previous: (data.previous.series[def.key][i] ?? 0) / def.unit,
  }));
  const rows = fold(wide, {
    fields: ["current", "previous"] as const,
    as: { key: "series", value: "value" },
  });
  const current = rows.filter((row) => row.series === "current");
  const previous = rows.filter((row) => row.series === "previous");
  const peak = current[peakIndex(current.map((row) => row.value))];
  const peaks = peak && peak.value > 0 ? [peak] : [];

  // Same text as everywhere else in the app: "51 h 12 m", "1,204".
  const value = (v: number) => format.as(v * def.unit, def.kind);
  const series: Series = {
    current: { label: names.current, color: CURRENT, format: value },
    previous: { label: names.previous, color: PREVIOUS, format: value },
  };

  // Weekly buckets only label the first week of each month.
  const tickByLabel = new Map(data.labels.map((label, i) => [label, data.ticks[i] ?? ""]));
  const ticks =
    data.unit === "week"
      ? {
          values: data.labels.filter((label) => tickByLabel.get(label)),
          format: (label: string) => tickByLabel.get(label) ?? label,
        }
      : data.unit === "day" && data.labels.length > 31
        ? { values: data.labels.filter((_, i) => i % 30 === 0) }
        : {};

  return defineChart({
    ...chartBase,
    color: seriesColor(series),
    ...columnTooltip(series),
    marks: [
      decorative(
        areaY(current, {
          id: "current-area",
          x: "label",
          y: "value",
          fill: "url(#current-fade)",
          curve: curves.monotone,
        }),
      ),
      lineY(previous, {
        id: "previous",
        x: "label",
        y: "value",
        z: "series",
        curve: curves.monotone,
        strokeWidth: 1,
        strokeDasharray: "4 4",
      }),
      // The current line comes last so it draws over the previous one.
      lineY(current, {
        id: "current",
        x: "label",
        y: "value",
        z: "series",
        curve: curves.monotone,
        strokeWidth: 2,
      }),
      decorative(
        dot(peaks, {
          id: "peak",
          x: "label",
          y: "value",
          r: 4,
          fill: colors.background,
          stroke: CURRENT,
          strokeWidth: 2,
        }),
      ),
      columnGuide(),
    ],
    scales: {
      x: { ...xPoint(data.labels.length > 0 ? ticks : undefined), grid: gridDown },
      y: yValue({ format: (v) => format.as(v, "compact") }),
    },
    gradients: [fadeGradient("current-fade", CURRENT)],
  });
};

// Room the peak badge needs above its point, in pixels.
const BADGE_ROOM = 30;

const KpiChart = ({ data, def, names }: KpiChartProps) => {
  const definition = useMemo(() => buildChart({ data, def, names }), [data, def, names]);
  const badge = useRef<HTMLDivElement>(null);
  const values = data.current.series[def.key];
  const index = peakIndex(values);
  const peak = (values[index] ?? 0) > 0 ? data.labels[index] : undefined;
  const value = format.as(values[index] ?? 0, def.kind);

  // The badge comes first so its ref is set when the chart draws.
  return (
    <div className="relative">
      <div
        ref={badge}
        aria-hidden
        className="pointer-events-none invisible absolute z-10 rounded-md border bg-popover px-1.5 py-0.5 text-[10px] whitespace-nowrap text-muted-foreground tabular-nums"
      >
        <span className="font-medium text-foreground">{value}</span> peak
      </div>
      <Chart
        definition={definition}
        ariaLabel={`${def.label} over time`}
        aspectRatio={3}
        onRender={({ scene }) => {
          const element = badge.current;
          const { x, y } = scene.scales;
          if (!element || !x || !y) return;
          if (!peak) {
            element.style.visibility = "hidden";
            return;
          }
          const top = y.map((values[index] ?? 0) / def.unit);
          // Too close to the top, the badge goes under the point instead of being cut.
          const below = top - BADGE_ROOM < scene.chart.y;
          // Centered on the point, but kept inside the plot at both ends.
          const plot = scene.chart;
          const width = element.offsetWidth;
          const left = Math.min(
            Math.max(x.map(peak) - width / 2, plot.x),
            plot.x + plot.width - width,
          );
          element.style.left = `${left}px`;
          element.style.top = `${top}px`;
          element.style.transform = below ? "translateY(10px)" : "translateY(calc(-100% - 10px))";
          element.style.visibility = "visible";
        }}
      />
    </div>
  );
};

const Legend = ({ names }: { names: { current: string; previous: string } }) => (
  <div className="flex items-center gap-4 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="h-0.5 w-3 rounded-full bg-chart-1" />
      {names.current}
    </span>
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="w-3 border-t border-dashed border-muted-foreground" />
      {names.previous}
    </span>
  </div>
);

// The four totals of the period as tabs, each opening its curve against the period before.
export const KpiChartWidget = () => {
  const { range, full } = useRanges();
  const [picked, setPicked] = useState<Unit | undefined>(undefined);
  const { data } = useQuery({
    ...overviewQueries.kpis.queryOptions(range, full, picked),
    // The previous unit stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
  const [key, setKey] = useState<Key>("minutes");
  const names = useMemo(() => periodNames(full), [full]);

  // Same height as the loaded widget: the four KPI tabs, then the chart card.
  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-84 rounded-lg" />
      </div>
    );
  }
  if (data.current.totals.streams === 0) {
    return (
      <Empty variant="framed" className="py-10">
        No listening in this period.
      </Empty>
    );
  }

  const def = metrics.find((m) => m.key === key) ?? metrics[0]!;

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <Tabs value={key} onValueChange={(next: Key) => setKey(next)}>
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-2 gap-2 p-0 group-data-horizontal/tabs:h-auto lg:grid-cols-4"
        >
          {metrics.map((m) => (
            <TabsTrigger
              key={m.key}
              value={m.key}
              nativeButton={false}
              render={<Stat />}
              className="group/tab h-auto cursor-pointer items-start justify-start gap-2 rounded-lg px-4 py-3 text-left ring-foreground/10 transition-colors after:hidden hover:bg-card/50 data-active:bg-card! data-active:ring-1"
            >
              <Stat.Label className="flex items-center gap-1.5 transition-colors group-data-active/tab:text-foreground">
                {m.label}
              </Stat.Label>
              <div className="flex items-baseline gap-2">
                <Stat.Value
                  value={data.current.totals[m.key]}
                  kind={m.kind}
                  size="xl"
                  className="text-foreground/75 transition-colors group-hover/tab:text-foreground/70 group-data-active/tab:text-foreground"
                />
                <Delta
                  tone={m.key === key ? "auto" : "muted"}
                  value={delta(data.current.totals[m.key], data.previous.totals[m.key])}
                />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card size="xs" className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
          <Legend names={names} />
          <FigureViews
            views={UNITS}
            value={data.unit}
            onChange={(next) => {
              if (isUnit(next)) setPicked(next);
            }}
          />
        </div>
        <div className="px-4 pt-2 pb-3">
          <KpiChart data={data} def={def} names={names} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-sm">
          <p className="text-muted-foreground tabular-nums">
            {def.hint(data.current.totals, data.days)}
          </p>
          <Link
            from="/app/$packageId"
            to={def.to}
            preload="intent"
            className="flex items-center gap-1 text-primary transition-colors hover:text-foreground"
          >
            {def.more}
            <Icon icon={ArrowRight01Icon} size={14} />
          </Link>
        </div>
      </Card>
    </section>
  );
};
