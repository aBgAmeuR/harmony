"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import { getSkippedHabitAction } from "~/actions/get-skipped-habit-action";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";

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

type InitialData = Awaited<ReturnType<typeof getSkippedHabitAction>>;

type SkippedHabitChartProps = {
  initialData: InitialData;
};

const useChartData = (minDate: Date, maxDate: Date, initialData: InitialData) =>
  useQuery({
    queryKey: ["skippedHabits", minDate, maxDate],
    queryFn: async () => await getSkippedHabitAction(minDate, maxDate),
    initialData,
  });

export const SkippedHabitChart = ({ initialData }: SkippedHabitChartProps) => {
  const dates = useRankingTimeRange((state) => state.dates);
  const {
    data: chartData,
    isLoading,
    isError,
  } = useChartData(
    new Date(dates.start),
    addMonths(new Date(dates.end), 1),
    initialData,
  );

  if (isLoading) return null;
  if (isError || !chartData) return null;

  // const nbSkippedTracks =
  //   chartData.find((skip) => skip.skipped === "Skipped")?.totalPlayed || 0;
  // const totalTracks = chartData.reduce(
  //   (acc, curr) => acc + curr.totalPlayed,
  //   0,
  // );
  const skippedPercentage = Math.round(
    (chartData[0].skipped / (chartData[0].skipped + chartData[0].notSkipped)) *
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
          fill="var(--color-skipped)"
          stackId="a"
          cornerRadius={5}
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
  );
};
