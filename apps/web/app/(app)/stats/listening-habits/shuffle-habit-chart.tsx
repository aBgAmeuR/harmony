"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import { getShuffleHabit } from "./get-charts-data";

const chartConfig = {
  Shuffled: {
    label: "Shuffled",
    color: "hsl(var(--chart-1))",
  },
  "Not Shuffled": {
    label: "Not Shuffled",
    color: "hsl(var(--chart-6))",
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

  const nbShuffledTracks =
    chartData.find((shuffle) => shuffle.shuffle === "Shuffled")?.totalPlayed ||
    0;
  const totalTracks = chartData.reduce(
    (acc, curr) => acc + curr.totalPlayed,
    0,
  );
  const shuffledPercentage = Math.round((nbShuffledTracks / totalTracks) * 100);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="totalPlayed"
          nameKey="shuffle"
          innerRadius={60}
          strokeWidth={5}
          activeIndex={0}
          activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
            <Sector {...props} outerRadius={outerRadius + 10} />
          )}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {shuffledPercentage}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Tracks Shuffled
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};
