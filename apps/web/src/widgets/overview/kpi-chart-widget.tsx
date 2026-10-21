import {
  Chart,
  areaY,
  barY,
  chartBase,
  colors,
  columnBand,
  columnGuide,
  columnTooltip,
  curves,
  decorative,
  defineChart,
  dot,
  fadeGradient,
  fold,
  gridDown,
  group,
  lineY,
  seriesColor,
  text,
  xBand,
  xPoint,
  yValue,
  type Series,
} from "@harmony/charts/v4";
import { ChartColumnIcon, ChartLineData01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { Overview, Totals } from "@/data/overview/kpis";
import type { Kind } from "@/utils/format";

import { measure } from "@/shared/lib/measure";
import { Delta } from "@/shared/primitives/delta";
import { Empty } from "@/shared/primitives/empty";
import { Stat } from "@/shared/primitives/stat";
import { Toolbar } from "@/shared/primitives/toolbar";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { compareLabel, delta } from "./format";
import { useRanges } from "./use-range";

type Key = "minutes" | "streams" | "artists" | "days";

type MetricDef = {
  key: Key;
  label: string;
  kind: Kind;
  hint: (totals: Totals, days: number) => string;
  // Raw units in one chart unit: the chart plots minutes as hours, the tooltip formats raw values.
  unit: number;
};

const metrics: MetricDef[] = [
  {
    key: "minutes",
    ...measure.playtime,
    hint: (t) => `${(t.minutes / 1440).toFixed(1)} days of non-stop music`,
    unit: 60,
  },
  {
    key: "streams",
    ...measure.streams,
    hint: (t) => `${format.count(t.streams / Math.max(t.days, 1))} per active day`,
    unit: 1,
  },
  {
    key: "artists",
    ...measure.artists,
    hint: (t) => `${format.count(t.tracks)} distinct tracks`,
    unit: 1,
  },
  {
    key: "days",
    ...measure.days,
    hint: (_, days) => `out of ${format.count(days)} days`,
    unit: 1,
  },
];

const CURRENT = "var(--chart-1)";
const PREVIOUS = "color-mix(in srgb, var(--muted-foreground) 55%, transparent)";

const peakIndex = (values: number[]): number =>
  values.reduce((best, value, i) => (value > (values[best] ?? 0) ? i : best), 0);

type KpiChartProps = {
  data: Overview;
  def: MetricDef;
  against: string;
  compare: boolean;
};

// What the line and bar views share: one row per bucket and series, the series, the x ticks and
// the column tooltip.
const prepare = ({ data, def, against, compare }: KpiChartProps) => {
  const wide = data.labels.map((label, i) => ({
    label,
    current: (data.current.series[def.key][i] ?? 0) / def.unit,
    previous: (data.previous.series[def.key][i] ?? 0) / def.unit,
  }));
  const rows = fold(wide, {
    fields: ["current", "previous"] as const,
    as: { key: "series", value: "value" },
  }).filter((row) => compare || row.series === "current");

  // Same text as everywhere else in the app: "51 h 12 m", "1,204".
  const value = (v: number) => format.as(v * def.unit, def.kind);
  const series: Series = {
    current: { label: def.label, color: CURRENT, format: value },
    previous: { label: against, color: PREVIOUS, format: value },
  };

  // Weekly buckets only label the first week of each month.
  const tickByLabel = new Map(data.labels.map((label, i) => [label, data.ticks[i] ?? ""]));
  const ticks =
    data.unit === "week"
      ? {
          values: data.labels.filter((label) => tickByLabel.get(label)),
          format: (label: string) => tickByLabel.get(label) ?? label,
        }
      : {};

  return {
    rows,
    ticks,
    spec: {
      ...chartBase,
      color: seriesColor(series),
      ...columnTooltip(series),
    },
    y: yValue({ format: (v) => format.as(v, "compact") }),
  };
};

const KpiLineChart = ({ data, def, against, compare }: KpiChartProps) => {
  const definition = useMemo(() => {
    const { rows, ticks, spec, y } = prepare({ data, def, against, compare });
    const current = rows.filter((row) => row.series === "current");
    const previous = rows.filter((row) => row.series === "previous");
    const peak = current[peakIndex(current.map((row) => row.value))];
    const peaks = peak ? [peak] : [];

    return defineChart({
      ...spec,
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
        // The lines own the points: their color comes from the series.
        lineY(current, {
          id: "current",
          x: "label",
          y: "value",
          z: "series",
          curve: curves.monotone,
          strokeWidth: 2,
        }),
        lineY(previous, {
          id: "previous",
          x: "label",
          y: "value",
          z: "series",
          curve: curves.monotone,
          strokeWidth: 1,
          strokeDasharray: "4 4",
        }),
        decorative(
          dot(peaks, {
            id: "peak",
            x: "label",
            y: "value",
            r: 4,
            fill: CURRENT,
            stroke: colors.background,
            strokeWidth: 2,
          }),
        ),
        decorative(
          text(peaks, {
            id: "peak-label",
            x: "label",
            y: "value",
            text: (row) => `Peak · ${row.label}`,
            dy: -14,
            fontSize: 11,
            fill: colors.muted,
          }),
        ),
        columnGuide(),
      ],
      scales: { x: { ...xPoint(ticks), grid: gridDown }, y },
      gradients: [fadeGradient("current-fade", CURRENT)],
    });
  }, [data, def, against, compare]);

  return <Chart definition={definition} ariaLabel={`${def.label} over time`} aspectRatio={4} />;
};

const KpiBarChart = ({ data, def, against, compare }: KpiChartProps) => {
  const definition = useMemo(() => {
    const { rows, ticks, spec, y } = prepare({ data, def, against, compare });

    return defineChart({
      ...spec,
      marks: [
        barY(rows, {
          id: "bars",
          x: "label",
          y: "value",
          z: "series",
          radius: 2,
          layout: group({ padding: 0.1 }),
        }),
        columnBand(),
      ],
      scales: { x: { ...xBand(ticks), grid: gridDown }, y },
    });
  }, [data, def, against, compare]);

  return <Chart definition={definition} ariaLabel={`${def.label} over time`} aspectRatio={4} />;
};

export const KpiChartWidget = () => {
  const { range, full } = useRanges();
  const { data } = useQuery(overviewQueries.kpis.queryOptions(range, full));
  const [key, setKey] = useState<Key>("minutes");
  const [compare, setCompare] = useState(true);
  const [mode, setMode] = useState<"line" | "bar">("line");

  // Same height as the loaded widget: the KPI tabs and toolbar, then the 4:1 chart.
  if (!data) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="aspect-4/1 rounded-lg" />
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
  const against = compareLabel(data.previous.from, data.previous.to);

  return (
    <section className="flex min-w-0 flex-col">
      <Tabs value={key} onValueChange={(next: Key) => setKey(next)}>
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-2 gap-x-6 p-0 group-data-horizontal/tabs:h-auto lg:grid-cols-4"
        >
          {metrics.map((m) => (
            <TabsTrigger
              key={m.key}
              value={m.key}
              nativeButton={false}
              render={<Stat />}
              className="group/tab h-auto items-start justify-start gap-1.5 rounded-none px-0 py-4 text-left after:hidden"
            >
              <Stat.Label className="text-sm font-medium transition-colors group-data-active/tab:text-foreground">
                {m.label}
              </Stat.Label>
              <div className="flex items-end gap-2">
                <Stat.Value
                  value={data.current.totals[m.key]}
                  kind={m.kind}
                  size="xl"
                  className="text-foreground/25 transition-colors group-hover/tab:text-foreground/50 group-data-active/tab:text-foreground"
                />
                <Delta
                  tone={m.key === key ? "auto" : "muted"}
                  className="mb-1"
                  value={delta(data.current.totals[m.key], data.previous.totals[m.key])}
                />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Toolbar className="justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted-foreground">{def.hint(data.current.totals, data.days)}</p>
        <Toolbar.End>
          <Button
            variant={compare ? "secondary" : "outline"}
            aria-pressed={compare}
            onClick={() => setCompare((current) => !current)}
          >
            Compare
          </Button>
          <Tabs value={mode} onValueChange={(next) => setMode(next === "bar" ? "bar" : "line")}>
            <TabsList className="p-0.5 group-data-horizontal/tabs:h-7">
              <TabsTrigger value="line" aria-label="Line chart" className="w-6 flex-none px-0">
                <Icon icon={ChartLineData01Icon} size={14} />
              </TabsTrigger>
              <TabsTrigger value="bar" aria-label="Bar chart" className="w-6 flex-none px-0">
                <Icon icon={ChartColumnIcon} size={14} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Toolbar.End>
      </Toolbar>

      <div className="pt-0">
        {mode === "line" ? (
          <KpiLineChart data={data} def={def} against={against} compare={compare} />
        ) : (
          <KpiBarChart data={data} def={def} against={against} compare={compare} />
        )}
      </div>
    </section>
  );
};
