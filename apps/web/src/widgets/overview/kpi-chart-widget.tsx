import { AreaChart, BarChart } from "@harmony/charts/v4";
import { ChartColumnIcon, ChartLineData01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { Totals } from "@/data/overview/kpis";
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
  // chart values and tooltip unit
  scale: (value: number) => number;
  suffix: string;
};

const metrics: MetricDef[] = [
  {
    key: "minutes",
    ...measure.playtime,
    hint: (t) => `${(t.minutes / 1440).toFixed(1)} days of non-stop music`,
    scale: (v) => Math.round((v / 60) * 10) / 10,
    suffix: "h",
  },
  {
    key: "streams",
    ...measure.streams,
    hint: (t) => `${format.count(t.streams / Math.max(t.days, 1))} per active day`,
    scale: (v) => v,
    suffix: "",
  },
  {
    key: "artists",
    ...measure.artists,
    hint: (t) => `${format.count(t.tracks)} distinct tracks`,
    scale: (v) => v,
    suffix: "",
  },
  {
    key: "days",
    ...measure.days,
    hint: (_, days) => `out of ${format.count(days)} days`,
    scale: (v) => v,
    suffix: "",
  },
];

const CURRENT = "var(--chart-1)";
const PREVIOUS = "color-mix(in srgb, var(--muted-foreground) 55%, transparent)";

const peakIndex = (values: number[]): number =>
  values.reduce((best, value, i) => (value > (values[best] ?? 0) ? i : best), 0);

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
  const yFormat = (value: number) => format.as(value, "compact");

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
