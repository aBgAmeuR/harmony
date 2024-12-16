"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { getMsPlayedInHours } from "~/lib/utils";

import { getDaysHabit } from "./get-charts-data";

const chartConfig = {
  msPlayed: {
    label: "Listening Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Data = Awaited<ReturnType<typeof getDaysHabit>>;

type DaysHabitChartProps = {
  data: Data;
};

export const DaysHabitChart = ({ data: chartData }: DaysHabitChartProps) => {
  if (!chartData) return null;

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 24,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => (
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{item.payload.day}</div>
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
          cursor={true}
        />
        <Bar dataKey="msPlayed" fill="var(--color-msPlayed)" radius={8}>
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
            formatter={(value: number) => `${getMsPlayedInHours(value)}h`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
