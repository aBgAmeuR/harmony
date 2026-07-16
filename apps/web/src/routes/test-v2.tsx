import type { ReactNode } from "react";

import {
  Area,
  AreaChart,
  type AreaProps,
  Bar,
  BarChart,
  type BarProps,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  type LineProps,
  SparklineChart,
  XAxis,
} from "@harmony/charts/v2";
import { Card, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test-v2")({
  component: RouteComponent,
});

type Row = Record<string, unknown>;

const START_DATE = new Date("2020-02-01");

function makeMonthly(count: number, valueFn: (index: number) => number): Row[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(START_DATE.getFullYear(), START_DATE.getMonth() + index, 1);
    return {
      label: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
      value: valueFn(index),
    };
  });
}

const DATA_MONTHLY = makeMonthly(30, () => Math.floor(Math.random() * 10001));
const DATA_TINY = makeMonthly(3, (index) => (index + 1) * 1200);
const DATA_SINGLE = makeMonthly(1, () => 5400);
const DATA_LARGE = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + index);
  return {
    label: date.toLocaleString("en-US", { month: "short", day: "numeric" }),
    value: Math.floor(Math.random() * 5000) + 500,
  };
});
const DATA_FLAT = makeMonthly(12, () => 4200);
const DATA_WITH_ZEROS = makeMonthly(12, (index) => (index % 3 === 0 ? 0 : 3000 + index * 200));
const DATA_NEGATIVE = makeMonthly(12, (index) =>
  index % 2 === 0 ? 2000 + index * 100 : -800 - index * 50,
);
const DATA_SPIKY = makeMonthly(20, (index) => (index === 10 ? 50000 : 1200 + index * 80));
const DATA_LONG_LABELS = makeMonthly(10, (index) => 2000 + index * 300).map((row, index) => ({
  ...row,
  label: `Very Long Category Label ${index + 1} — ${String(row.label)}`,
}));
const DATA_EMPTY: Row[] = [];

interface ChartCaseProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

function ChartCase({
  title,
  description,
  children,
  className = "",
  compact = false,
}: ChartCaseProps) {
  return (
    <Card className={className} size="sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className={compact ? "h-28" : undefined}>{children}</CardContent>
    </Card>
  );
}

function FullChromeBar({ data, ...seriesProps }: { data: Row[] } & Partial<BarProps>) {
  return (
    <BarChart data={data} xDataKey="label">
      <Bar dataKey="value" {...seriesProps} />
      <Grid />
      <XAxis />
      <ChartTooltip />
    </BarChart>
  );
}

function FullChromeLine({ data, ...seriesProps }: { data: Row[] } & Partial<LineProps>) {
  return (
    <LineChart data={data} xDataKey="label">
      <Line dataKey="value" {...seriesProps} />
      <Grid />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function FullChromeArea({ data, ...seriesProps }: { data: Row[] } & Partial<AreaProps>) {
  return (
    <AreaChart data={data} xDataKey="label">
      <Area dataKey="value" {...seriesProps} />
      <Grid />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function RouteComponent() {
  return (
    <div className="flex flex-col gap-10 p-4">
      <div>
        <h1 className="text-2xl font-semibold">uPlot v2 chart matrix</h1>
        <p className="text-sm text-muted-foreground">
          Compound API smoke tests — child combinations, data shapes, styling, and layout cases.
        </p>
      </div>

      <Section title="Bar charts">
        <ChartCase description="Grid + XAxis + ChartTooltip" title="Full chrome">
          <FullChromeBar data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase description="Series only, no plugins" title="Bare series">
          <BarChart data={DATA_MONTHLY} xDataKey="label">
            <Bar dataKey="value" />
          </BarChart>
        </ChartCase>
        <ChartCase description="Grid child only" title="Grid only">
          <BarChart data={DATA_MONTHLY} xDataKey="label">
            <Bar dataKey="value" />
            <Grid />
          </BarChart>
        </ChartCase>
        <ChartCase description="XAxis child only" title="XAxis only">
          <BarChart data={DATA_MONTHLY} xDataKey="label">
            <Bar dataKey="value" />
            <XAxis />
          </BarChart>
        </ChartCase>
        <ChartCase description="ChartTooltip child only" title="Tooltip only">
          <BarChart data={DATA_MONTHLY} xDataKey="label">
            <Bar dataKey="value" />
            <ChartTooltip />
          </BarChart>
        </ChartCase>
        <ChartCase description="ChartTooltip suffix=min" title="Tooltip suffix">
          <BarChart data={DATA_MONTHLY} xDataKey="label">
            <Bar dataKey="value" />
            <ChartTooltip suffix="min" />
          </BarChart>
        </ChartCase>
        <ChartCase description="Grid + XAxis, no tooltip" title="Grid + XAxis">
          <BarChart data={DATA_MONTHLY} xDataKey="label">
            <Bar dataKey="value" />
            <Grid />
            <XAxis />
          </BarChart>
        </ChartCase>
        <ChartCase description="XAxis + ChartTooltip, no grid" title="XAxis + Tooltip">
          <BarChart data={DATA_MONTHLY} xDataKey="label">
            <Bar dataKey="value" />
            <XAxis />
            <ChartTooltip />
          </BarChart>
        </ChartCase>
        <ChartCase description="fill=var(--chart-2)" title="Custom fill --chart-2">
          <FullChromeBar data={DATA_MONTHLY} fill="var(--chart-2)" label="Streams" />
        </ChartCase>
        <ChartCase description="fill=var(--chart-3)" title="Custom fill --chart-3">
          <FullChromeBar data={DATA_MONTHLY} fill="var(--chart-3)" label="Downloads" />
        </ChartCase>
        <ChartCase description="3 data points" title="Tiny dataset">
          <FullChromeBar data={DATA_TINY} />
        </ChartCase>
        <ChartCase description="Single bar" title="Single point">
          <FullChromeBar data={DATA_SINGLE} />
        </ChartCase>
        <ChartCase description="365 daily points, label thinning" title="Large dataset">
          <FullChromeBar data={DATA_LARGE} />
        </ChartCase>
        <ChartCase description="All values equal" title="Flat values">
          <FullChromeBar data={DATA_FLAT} />
        </ChartCase>
        <ChartCase description="Some zero values" title="With zeros">
          <FullChromeBar data={DATA_WITH_ZEROS} />
        </ChartCase>
        <ChartCase description="Positive and negative mix" title="Negative values">
          <FullChromeBar data={DATA_NEGATIVE} />
        </ChartCase>
        <ChartCase description="Large outlier spike" title="Spiky outlier">
          <FullChromeBar data={DATA_SPIKY} />
        </ChartCase>
        <ChartCase description="Long x-axis labels" title="Long labels">
          <FullChromeBar data={DATA_LONG_LABELS} />
        </ChartCase>
        <ChartCase description="Graceful empty container" title="Empty data">
          <FullChromeBar data={DATA_EMPTY} />
        </ChartCase>
        <ChartCase
          className="md:col-span-2 xl:col-span-3"
          description="Full-width bar chart"
          title="Wide layout"
        >
          <FullChromeBar data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase compact description="Fixed short card height" title="Compact height">
          <FullChromeBar data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase description="Two independent instances side by side" title="Side by side">
          <div className="grid grid-cols-2 gap-2">
            <FullChromeBar data={DATA_TINY} />
            <FullChromeBar data={DATA_SPIKY} />
          </div>
        </ChartCase>
      </Section>

      <Section title="Line charts">
        <ChartCase description="Grid + XAxis + ChartTooltip" title="Full chrome">
          <FullChromeLine data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase description="Series only" title="Bare series">
          <LineChart data={DATA_MONTHLY} xDataKey="label">
            <Line dataKey="value" />
          </LineChart>
        </ChartCase>
        <ChartCase description="Grid child only" title="Grid only">
          <LineChart data={DATA_MONTHLY} xDataKey="label">
            <Line dataKey="value" />
            <Grid />
          </LineChart>
        </ChartCase>
        <ChartCase description="XAxis child only" title="XAxis only">
          <LineChart data={DATA_MONTHLY} xDataKey="label">
            <Line dataKey="value" />
            <XAxis />
          </LineChart>
        </ChartCase>
        <ChartCase description="ChartTooltip child only" title="Tooltip only">
          <LineChart data={DATA_MONTHLY} xDataKey="label">
            <Line dataKey="value" />
            <ChartTooltip />
          </LineChart>
        </ChartCase>
        <ChartCase description="Grid + XAxis" title="Grid + XAxis">
          <LineChart data={DATA_MONTHLY} xDataKey="label">
            <Line dataKey="value" />
            <Grid />
            <XAxis />
          </LineChart>
        </ChartCase>
        <ChartCase description="XAxis + ChartTooltip" title="XAxis + Tooltip">
          <LineChart data={DATA_MONTHLY} xDataKey="label">
            <Line dataKey="value" />
            <XAxis />
            <ChartTooltip />
          </LineChart>
        </ChartCase>
        <ChartCase description="stroke=var(--chart-2)" title="Custom stroke --chart-2">
          <FullChromeLine data={DATA_MONTHLY} label="Listeners" stroke="var(--chart-2)" />
        </ChartCase>
        <ChartCase
          description="stroke=var(--chart-3), strokeWidth=3"
          title="Thick stroke --chart-3"
        >
          <FullChromeLine data={DATA_MONTHLY} stroke="var(--chart-3)" strokeWidth={3} />
        </ChartCase>
        <ChartCase description="3 data points" title="Tiny dataset">
          <FullChromeLine data={DATA_TINY} />
        </ChartCase>
        <ChartCase description="Single point line" title="Single point">
          <FullChromeLine data={DATA_SINGLE} />
        </ChartCase>
        <ChartCase description="365 daily points" title="Large dataset">
          <FullChromeLine data={DATA_LARGE} />
        </ChartCase>
        <ChartCase description="Horizontal flat line" title="Flat values">
          <FullChromeLine data={DATA_FLAT} />
        </ChartCase>
        <ChartCase description="Drops to zero" title="With zeros">
          <FullChromeLine data={DATA_WITH_ZEROS} />
        </ChartCase>
        <ChartCase description="Crosses zero" title="Negative values">
          <FullChromeLine data={DATA_NEGATIVE} />
        </ChartCase>
        <ChartCase description="Sharp spike" title="Spiky outlier">
          <FullChromeLine data={DATA_SPIKY} />
        </ChartCase>
        <ChartCase description="Label collision stress" title="Long labels">
          <FullChromeLine data={DATA_LONG_LABELS} />
        </ChartCase>
        <ChartCase description="No series rendered" title="Empty data">
          <FullChromeLine data={DATA_EMPTY} />
        </ChartCase>
        <ChartCase
          className="md:col-span-2 xl:col-span-3"
          description="Full-width line chart"
          title="Wide layout"
        >
          <FullChromeLine data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase compact description="Short card" title="Compact height">
          <FullChromeLine data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase description="Independent resize observers" title="Side by side">
          <div className="grid grid-cols-2 gap-2">
            <FullChromeLine data={DATA_TINY} />
            <FullChromeLine data={DATA_SPIKY} />
          </div>
        </ChartCase>
      </Section>

      <Section title="Area charts">
        <ChartCase description="Grid + XAxis + ChartTooltip" title="Full chrome">
          <FullChromeArea data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase description="Series only" title="Bare series">
          <AreaChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" />
          </AreaChart>
        </ChartCase>
        <ChartCase description="Grid child only" title="Grid only">
          <AreaChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" />
            <Grid />
          </AreaChart>
        </ChartCase>
        <ChartCase description="XAxis child only" title="XAxis only">
          <AreaChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" />
            <XAxis />
          </AreaChart>
        </ChartCase>
        <ChartCase description="ChartTooltip child only" title="Tooltip only">
          <AreaChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" />
            <ChartTooltip />
          </AreaChart>
        </ChartCase>
        <ChartCase description="Grid + XAxis" title="Grid + XAxis">
          <AreaChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" />
            <Grid />
            <XAxis />
          </AreaChart>
        </ChartCase>
        <ChartCase description="XAxis + ChartTooltip" title="XAxis + Tooltip">
          <AreaChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" />
            <XAxis />
            <ChartTooltip />
          </AreaChart>
        </ChartCase>
        <ChartCase description="fill=var(--chart-2)" title="Custom fill --chart-2">
          <FullChromeArea data={DATA_MONTHLY} fill="var(--chart-2)" label="Reach" />
        </ChartCase>
        <ChartCase description="fill=var(--chart-3)" title="Custom fill --chart-3">
          <FullChromeArea data={DATA_MONTHLY} fill="var(--chart-3)" stroke="var(--chart-3)" />
        </ChartCase>
        <ChartCase description="3 data points" title="Tiny dataset">
          <FullChromeArea data={DATA_TINY} />
        </ChartCase>
        <ChartCase description="Single point area" title="Single point">
          <FullChromeArea data={DATA_SINGLE} />
        </ChartCase>
        <ChartCase description="365 daily points" title="Large dataset">
          <FullChromeArea data={DATA_LARGE} />
        </ChartCase>
        <ChartCase description="Flat area band" title="Flat values">
          <FullChromeArea data={DATA_FLAT} />
        </ChartCase>
        <ChartCase description="Area with zero dips" title="With zeros">
          <FullChromeArea data={DATA_WITH_ZEROS} />
        </ChartCase>
        <ChartCase description="Area below zero" title="Negative values">
          <FullChromeArea data={DATA_NEGATIVE} />
        </ChartCase>
        <ChartCase description="Tall spike fill" title="Spiky outlier">
          <FullChromeArea data={DATA_SPIKY} />
        </ChartCase>
        <ChartCase description="Long label thinning" title="Long labels">
          <FullChromeArea data={DATA_LONG_LABELS} />
        </ChartCase>
        <ChartCase description="No render" title="Empty data">
          <FullChromeArea data={DATA_EMPTY} />
        </ChartCase>
        <ChartCase
          className="md:col-span-2 xl:col-span-3"
          description="Full-width area chart"
          title="Wide layout"
        >
          <FullChromeArea data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase compact description="Short card" title="Compact height">
          <FullChromeArea data={DATA_MONTHLY} />
        </ChartCase>
        <ChartCase description="Two area instances" title="Side by side">
          <div className="grid grid-cols-2 gap-2">
            <FullChromeArea data={DATA_TINY} />
            <FullChromeArea data={DATA_SPIKY} />
          </div>
        </ChartCase>
      </Section>

      <Section title="Sparkline charts">
        <ChartCase description="Default area sparkline, no chrome" title="Area sparkline">
          <SparklineChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="Line-only sparkline" title="Line sparkline">
          <SparklineChart data={DATA_MONTHLY} xDataKey="label">
            <Line dataKey="value" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="stroke=var(--chart-2)" title="Custom stroke">
          <SparklineChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" stroke="var(--chart-2)" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="fill=var(--chart-3)" title="Custom fill">
          <SparklineChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" fill="var(--chart-3)" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="3 points" title="Tiny dataset">
          <SparklineChart data={DATA_TINY} xDataKey="label">
            <Area dataKey="value" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="Single point" title="Single point">
          <SparklineChart data={DATA_SINGLE} xDataKey="label">
            <Area dataKey="value" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="Constant values" title="Flat values">
          <SparklineChart data={DATA_FLAT} xDataKey="label">
            <Area dataKey="value" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="Sharp spike" title="Spiky outlier">
          <SparklineChart data={DATA_SPIKY} xDataKey="label">
            <Area dataKey="value" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="365 daily points" title="Large dataset">
          <SparklineChart data={DATA_LARGE} xDataKey="label">
            <Area dataKey="value" />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="Optional ChartTooltip child" title="With tooltip">
          <SparklineChart data={DATA_MONTHLY} xDataKey="label">
            <Area dataKey="value" label="Plays" />
            <ChartTooltip />
          </SparklineChart>
        </ChartCase>
        <ChartCase description="Metric card proportions" title="Metric card style">
          <div className="max-w-xs">
            <SparklineChart className="-mb-0.5" data={DATA_MONTHLY} xDataKey="label">
              <Area dataKey="value" strokeWidth={2} />
            </SparklineChart>
          </div>
        </ChartCase>
        <ChartCase description="Two sparklines in one row" title="Side by side">
          <div className="grid grid-cols-2 gap-2">
            <SparklineChart data={DATA_TINY} xDataKey="label">
              <Area dataKey="value" />
            </SparklineChart>
            <SparklineChart data={DATA_SPIKY} xDataKey="label">
              <Line dataKey="value" stroke="var(--chart-2)" />
            </SparklineChart>
          </div>
        </ChartCase>
        <ChartCase description="No render" title="Empty data">
          <SparklineChart data={DATA_EMPTY} xDataKey="label">
            <Area dataKey="value" />
          </SparklineChart>
        </ChartCase>
      </Section>
    </div>
  );
}
