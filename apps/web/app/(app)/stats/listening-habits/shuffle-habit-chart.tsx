"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import { getShuffleHabit } from "./get-charts-data";

const chartConfig = {
  shuffled: {
    label: "Shuffled",
    color: "hsl(var(--chart-1))",
  },
  notShuffled: {
    label: "Not Shuffled",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Data = Awaited<ReturnType<typeof getShuffleHabit>>;

type ShuffleHabitChartProps = {
  data: Data;
};

export const ShuffleHabitChart = ({
  data: chartData,
}: ShuffleHabitChartProps) => {
  if (!chartData) return null;

  const shuffledPercentage = Math.round(
    (chartData[0].shuffled /
      (chartData[0].shuffled + chartData[0].notShuffled)) *
      100,
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px] w-full"
    >
      <RadialBarChart
        data={chartData}
        endAngle={180}
        innerRadius={80}
        outerRadius={130}
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
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
                      {`${shuffledPercentage}%`}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 4}
                      className="fill-muted-foreground"
                    >
                      Tracks Shuffled
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
        <RadialBar
          dataKey="shuffled"
          stackId="a"
          cornerRadius={5}
          fill="var(--color-shuffled)"
          className="stroke-transparent stroke-2"
        />
        <RadialBar
          dataKey="notShuffled"
          stackId="a"
          cornerRadius={5}
          fill="var(--color-notShuffled)"
          className="stroke-transparent stroke-2"
        />
      </RadialBarChart>
    </ChartContainer>
  );
};
