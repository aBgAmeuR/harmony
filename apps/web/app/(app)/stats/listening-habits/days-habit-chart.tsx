"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { getDaysHabitAction } from "~/actions/get-days-habit-action";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";
import { getMsPlayedInHours } from "~/lib/utils";

const chartConfig = {
  msPlayed: {
    label: "Listening Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type InitialData = Awaited<ReturnType<typeof getDaysHabitAction>>;

type DaysHabitChartProps = {
  initialData?: InitialData;
};

const useChartData = (
  minDate: Date,
  maxDate: Date,
  initialData: InitialData = [],
) =>
  useQuery({
    queryKey: ["daysHabit", minDate, maxDate],
    queryFn: async () => await getDaysHabitAction(minDate, maxDate),
    initialData,
  });

export const DaysHabitChart = ({ initialData }: DaysHabitChartProps) => {
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

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => (
                <>
                  <div
                    className="size-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                    style={
                      {
                        "--color-bg": `var(--color-${name})`,
                      } as React.CSSProperties
                    }
                  />
                  {chartConfig[name as keyof typeof chartConfig]?.label || name}
                  <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                    {getMsPlayedInHours(value.toString())}
                    <span className="font-normal text-muted-foreground">
                      days
                    </span>
                  </div>
                </>
              )}
            />
          }
          cursor={true}
          defaultIndex={1}
        />
        <Bar dataKey="msPlayed" fill="var(--color-msPlayed)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
};
