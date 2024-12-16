"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { getMsPlayedInHours } from "~/lib/utils";

import { getHoursHabit } from "./get-charts-data";

const chartConfig = {
  msPlayed: {
    label: "Listening Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Data = Awaited<ReturnType<typeof getHoursHabit>>;

type HoursHabitChartProps = {
  data: Data;
};

export const HoursHabitChart = ({ data: chartData }: HoursHabitChartProps) => {
  if (!chartData) return null;

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}h`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => (
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{item.payload.hour}h</div>
                  <div className="flex items-center gap-1">
                    <div
                      className="size-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                      style={
                        {
                          "--color-bg": `var(--color-${name})`,
                        } as React.CSSProperties
                      }
                    />
                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                      <NumberFlow
                        value={getMsPlayedInHours(value.toString())}
                      />
                      <span className="font-normal text-muted-foreground">
                        hours
                      </span>
                    </div>
                  </div>
                </div>
              )}
            />
          }
          cursor={false}
        />
        <defs>
          <linearGradient id="msPlayed" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-msPlayed)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-msPlayed)"
              stopOpacity={0.4}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="msPlayed"
          type="monotone"
          fill="url(#msPlayed)"
          fillOpacity={0.4}
          stroke="var(--color-msPlayed)"
        />
      </AreaChart>
    </ChartContainer>
  );
};
