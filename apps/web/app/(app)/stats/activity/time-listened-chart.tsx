"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
import { Skeleton } from "@repo/ui/skeleton";
import { format, localeFormat } from "light-date";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ReferenceLine,
  XAxis,
} from "recharts";

import { getMsPlayedInHours } from "~/lib/utils";

import { getMonthlyData } from "./get-data";

type Data = NonNullable<Awaited<ReturnType<typeof getMonthlyData>>>;

type TimeListenedChartProps = {
  data: Data;
};

const chartConfig = {
  month: {
    label: "month",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const msToHours = (ms: number) => ms / 1000 / 60 / 60;

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export function TimeListenedChart({ data: chartData }: TimeListenedChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Time Listened Over Months</CardTitle>
          <CardDescription>
            Showing total time listened in hours over the months
          </CardDescription>
        </div>
        <div className="flex flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
          <span className="text-xs text-muted-foreground">
            Average time listened
          </span>
          <span className="text-lg font-bold leading-none sm:text-3xl">
            <NumberFlow
              value={msToHours(chartData.average).toFixed(2)}
              suffix=" hours"
            />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video w-full">
          <BarChart accessibilityLayer data={chartData.data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={(props) => (
                <CustomTooltip {...props} chartData={chartData} />
              )}
              cursor={true}
            />
            <Bar dataKey="value" fill="var(--color-month)" radius={4} />
            <ReferenceLine
              y={chartData.average}
              stroke="red"
              strokeDasharray="3 3"
            >
              <Label value="Average" position="insideTopLeft" fill="red" />
            </ReferenceLine>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const TimeListenedChartSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Time Listened Over Months</CardTitle>
          <CardDescription>
            Showing total time listened in hours over the months
          </CardDescription>
        </div>
        <div className="flex flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
          <span className="text-xs text-muted-foreground">
            Average time listened
          </span>
          <span className="text-lg font-bold leading-none sm:text-3xl">
            <Skeleton className="w-48 h-[37.5px] my-1" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="size-full aspect-video" />
      </CardContent>
    </Card>
  );
};

type CustomTooltipProps = {
  payload?: any[];
  chartData: Data;
};

const CustomTooltip = ({ payload, chartData }: CustomTooltipProps) => {
  if (!payload || payload.length === 0) return null;
  const currentData = payload[0].payload;
  const currentIndex = chartData.data.findIndex(
    (item) => item.month === currentData.month,
  );
  const previousData =
    currentIndex > 0 ? chartData.data[currentIndex - 1] : null;
  const percentageChange = previousData
    ? calculatePercentageChange(currentData.value, previousData.value)
    : 0;
  const differenceFromAverage = currentData.value - chartData.average;

  return (
    <div className="flex flex-col gap-1 p-2 bg-background shadow-lg rounded-md">
      <div className="font-medium">
        {`${localeFormat(new Date(currentData.month), "{MMMM}")} ${format(new Date(currentData.month), "{yyyy}")}`}
      </div>
      <div className="flex items-center gap-1">
        <div
          className="size-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
          style={
            {
              "--color-bg": `var(--color-month)`,
            } as React.CSSProperties
          }
        />
        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
          <NumberFlow value={getMsPlayedInHours(currentData.value)} />
          <span className="font-normal text-muted-foreground">hours</span>
        </div>
      </div>
      {previousData && (
        <div className="flex items-center gap-1">
          <span className="font-normal text-muted-foreground">
            From previous month
          </span>
          {percentageChange > 0 ? (
            <TrendingUp className="text-green-500 size-3.5" />
          ) : (
            <TrendingDown className="text-red-500 size-3.5" />
          )}
          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
            <NumberFlow
              value={Math.abs(percentageChange).toFixed(2)}
              prefix={percentageChange > 0 ? "+" : "-"}
            />
            <span className="font-normal text-muted-foreground">%</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-normal text-muted-foreground">
          Diff from average
        </span>
        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
          <NumberFlow
            value={getMsPlayedInHours(Math.abs(differenceFromAverage))}
            prefix={differenceFromAverage > 0 ? "+" : "-"}
          />
          <span className="font-normal text-muted-foreground">hours</span>
        </div>
      </div>
    </div>
  );
};
