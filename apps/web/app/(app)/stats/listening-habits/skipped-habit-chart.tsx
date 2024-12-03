"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import { getSkippedHabitAction } from "~/actions/get-skipped-habit-action";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";

const chartConfig = {
  Skipped: {
    label: "Skipped",
    color: "hsl(var(--chart-1))",
  },
  "Not Skipped": {
    label: "Not Skipped",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type InitialData = Awaited<ReturnType<typeof getSkippedHabitAction>>;

type SkippedHabitChartProps = {
  initialData?: InitialData;
};

const useChartData = (
  minDate: Date,
  maxDate: Date,
  initialData: InitialData = [],
) =>
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

  const nbSkippedTracks =
    chartData.find((skip) => skip.skipped === "Skipped")?.totalPlayed || 0;
  const totalTracks = chartData.reduce(
    (acc, curr) => acc + curr.totalPlayed,
    0,
  );
  const skippedPercentage = Math.round((nbSkippedTracks / totalTracks) * 100);

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
          nameKey="skipped"
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
                      {skippedPercentage}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Tracks Skipped
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
