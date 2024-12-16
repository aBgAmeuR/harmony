"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import { getSkippedHabit } from "./get-charts-data";

const chartConfig = {
  skipped: {
    label: "Skipped",
    color: "hsl(var(--chart-1))",
  },
  notSkipped: {
    label: "Not Skipped",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Data = Awaited<ReturnType<typeof getSkippedHabit>>;

type SkippedHabitChartProps = {
  data: Data;
};

export const SkippedHabitChart = ({
  data: chartData,
}: SkippedHabitChartProps) => {
  if (!chartData) return null;

  const skippedPercentage = Math.round(
    (chartData[0].skipped / (chartData[0].skipped + chartData[0].notSkipped)) *
      100,
  );

  return (
    <div className="flex overflow-hidden w-full min-w-60 h-40 justify-center items-start">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full"
      >
        <RadialBarChart
          data={chartData}
          endAngle={180}
          innerRadius={80}
          outerRadius={130}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel numberFlow />}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 16}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {`${skippedPercentage}%`}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-muted-foreground"
                      >
                        Tracks Skipped
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            dataKey="skipped"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-skipped)"
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="notSkipped"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-notSkipped)"
            className="stroke-transparent stroke-2"
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};
