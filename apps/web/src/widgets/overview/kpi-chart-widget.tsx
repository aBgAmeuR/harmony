import { AreaChart, BarChart } from "@harmony/charts/v4";
import { ChartColumnIcon, ChartLineData01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { Totals } from "@/data/overview/kpis";

import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { compareLabel, delta, duration } from "./format";
import { Delta } from "./ui/delta";
import { Empty } from "./ui/empty";
import { useRanges } from "./use-range";

type Key = "minutes" | "streams" | "artists" | "days";

type MetricDef = {
  key: Key;
  label: string;
  value: (totals: Totals) => { value: string; unit?: string };
  hint: (totals: Totals, days: number) => string;
  // chart values and tooltip unit
  scale: (value: number) => number;
  suffix: string;
};

const metrics: MetricDef[] = [
  {
    key: "minutes",
    label: "Listening time",
    value: (t) => duration(t.minutes),
    hint: (t) => `${(t.minutes / 1440).toFixed(1)} days of non-stop music`,
    scale: (v) => Math.round((v / 60) * 10) / 10,
    suffix: "h",
  },
  {
    key: "streams",
    label: "Streams",
    value: (t) => ({ value: format.count(t.streams) }),
    hint: (t) => `${format.count(t.streams / Math.max(t.days, 1))} per active day`,
    scale: (v) => v,
    suffix: "",
  },
  {
    key: "artists",
    label: "Artists",
    value: (t) => ({ value: format.count(t.artists) }),
    hint: (t) => `${format.count(t.tracks)} distinct tracks`,
    scale: (v) => v,
    suffix: "",
  },
  {
    key: "days",
    label: "Active days",
    value: (t) => ({ value: format.count(t.days) }),
    hint: (_, days) => `out of ${format.count(days)} days`,
    scale: (v) => v,
    suffix: "",
  },
];

const CURRENT = "var(--chart-1)";
const PREVIOUS = "color-mix(in srgb, var(--muted-foreground) 55%, transparent)";
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const peakIndex = (values: number[]): number =>
  values.reduce((best, value, i) => (value > (values[best] ?? 0) ? i : best), 0);

export const KpiChartWidget = () => {
  const { range, full } = useRanges();
  const { data } = useQuery(overviewQueries.kpis.queryOptions(range, full));
  const [key, setKey] = useState<Key>("minutes");
  const [compare, setCompare] = useState(true);
  const [mode, setMode] = useState<"line" | "bar">("line");

  if (!data) return <div className="h-96 animate-pulse rounded-lg bg-card" />;
  if (data.current.totals.streams === 0) return <Empty>No listening in this period.</Empty>;

  const def = metrics.find((m) => m.key === key) ?? metrics[0]!;
  const against = compareLabel(data.previous.from, data.previous.to);

  const series = data.current.series[key];
  const before = data.previous.series[key];
  const rows = data.labels.map((label, i) => ({
    label,
    current: def.scale(series[i] ?? 0),
    previous: def.scale(before[i] ?? 0),
  }));

  const peakLabel = data.labels[peakIndex(rows.map((r) => r.current))] ?? "";
  const suffix = def.suffix ? ` ${def.suffix}` : "";

  // Weekly buckets only label the first week of each month.
  const monthly = data.unit === "week";
  const tickByLabel = new Map(data.labels.map((label, i) => [label, data.ticks[i] ?? ""]));
  const ticks = monthly ? data.labels.filter((label) => tickByLabel.get(label)) : undefined;
  const tickFormat = monthly ? (label: string) => tickByLabel.get(label) ?? label : undefined;
  const yFormat = (value: number) => compact.format(value);

  return (
    <section className="flex min-w-0 flex-col">
      <Tabs value={key} onValueChange={(next) => setKey(next as Key)}>
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-2 gap-x-6 p-0 group-data-horizontal/tabs:h-auto lg:grid-cols-4"
        >
          {metrics.map((m) => {
            const active = m.key === key;
            const { value, unit } = m.value(data.current.totals);

            return (
              <TabsTrigger
                key={m.key}
                value={m.key}
                className="group/tab h-auto flex-col items-start justify-start gap-1.5 rounded-none px-0 py-4 text-left after:hidden"
              >
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {m.label}
                </span>
                <div className="flex items-end gap-2">
                  <span className="flex items-baseline gap-1.5 text-3xl leading-none font-semibold tracking-tighter text-foreground/25 tabular-nums transition-colors group-hover/tab:text-foreground/50 group-data-active/tab:text-foreground md:text-4xl">
                    {value}
                    {unit ? (
                      <span className="text-xl font-medium text-muted-foreground md:text-2xl">
                        {unit}
                      </span>
                    ) : null}
                  </span>
                  <Delta
                    muted={!active}
                    className="mb-1 text-xs"
                    value={delta(data.current.totals[m.key], data.previous.totals[m.key])}
                  />
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted-foreground">{def.hint(data.current.totals, data.days)}</p>
        <div className="flex items-center gap-1">
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
        </div>
      </div>

      <div className="pt-0">
        {mode === "line" ? (
          <AreaChart data={rows} x="label" ariaLabel={`${def.label} over time`} aspectRatio={4}>
            <AreaChart.Area dataKey="current" label={def.label} color={CURRENT} />
            {compare ? (
              <AreaChart.Line
                dataKey="previous"
                label={against}
                color={PREVIOUS}
                width={1}
                dashed
              />
            ) : null}
            <AreaChart.Marker dataKey="current" label={`Peak · ${peakLabel}`} />
            <AreaChart.XAxis ticks={ticks} format={tickFormat} />
            <AreaChart.YAxis ticks={3} format={yFormat} />
            <AreaChart.Grid vertical />
            <AreaChart.Tooltip suffix={suffix} />
          </AreaChart>
        ) : (
          <BarChart data={rows} x="label" ariaLabel={`${def.label} over time`} aspectRatio={4}>
            <BarChart.Bar dataKey="current" label={def.label} color={CURRENT} />
            {compare ? <BarChart.Bar dataKey="previous" label={against} color={PREVIOUS} /> : null}
            <BarChart.XAxis ticks={ticks} format={tickFormat} />
            <BarChart.YAxis ticks={3} format={yFormat} />
            <BarChart.Grid vertical />
            <BarChart.Tooltip suffix={suffix} />
          </BarChart>
        )}
      </div>
    </section>
  );
};
