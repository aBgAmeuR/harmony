"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { getHoursHabitAction } from "~/actions/get-hours-habit-action";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";
import { getMsPlayedInHours } from "~/lib/utils";

const chartConfig = {
  msPlayed: {
    label: "Listening Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type InitialData = Awaited<ReturnType<typeof getHoursHabitAction>>;

type HoursHabitChartProps = {
  initialData?: InitialData;
};

const useChartData = (
  minDate: Date,
  maxDate: Date,
  initialData: InitialData = [],
) =>
  useQuery({
    queryKey: ["hoursHabit", minDate, maxDate],
    queryFn: async () => await getHoursHabitAction(minDate, maxDate),
    initialData,
  });

export const HoursHabitChart = ({ initialData }: HoursHabitChartProps) => {
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
                    <NumberFlow value={getMsPlayedInHours(value.toString())} />
                    <span className="font-normal text-muted-foreground">
                      hours
                    </span>
                  </div>
                </>
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
