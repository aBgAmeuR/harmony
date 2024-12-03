"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Label, Pie, PieChart } from "recharts";

import { getTopPlatformsAction } from "~/actions/get-top-platforms-action";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";
import { getMsPlayedInHours } from "~/lib/utils";

const chartConfig = {
  // msPlayed: {
  //   label: "Listening Time",
  //   color: "hsl(var(--chart-2))",
  // },
} satisfies ChartConfig;

type InitialData = Awaited<ReturnType<typeof getTopPlatformsAction>>;

type TopPlatformChartProps = {
  initialData?: InitialData;
};

const colorData = (data: InitialData) => {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ];

  return data?.map((item, index) => ({
    ...item,
    fill: colors[index],
  }));
};

const useChartData = (
  minDate: Date,
  maxDate: Date,
  initialData: InitialData = [],
) =>
  useQuery({
    queryKey: ["topPlatforms", minDate, maxDate],
    queryFn: async () => await getTopPlatformsAction(minDate, maxDate),
    initialData,
  });

export const TopPlatformChart = ({ initialData }: TopPlatformChartProps) => {
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

  const totalListings = chartData.reduce(
    (total, { msPlayed }) => total + msPlayed,
    0,
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square size-64"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, props) => (
                <>
                  <div
                    className="size-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                    style={
                      {
                        "--color-bg": props.payload?.fill,
                      } as React.CSSProperties
                    }
                  />
                  <p className="line-clamp-1 break-all max-w-32">
                    {name.toString().trim()}
                  </p>
                  <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                    {getMsPlayedInHours(value.toString())}
                    <span className="font-normal text-muted-foreground">
                      hours
                    </span>
                  </div>
                </>
              )}
            />
          }
        />
        <Pie
          data={colorData(chartData)}
          dataKey="msPlayed"
          nameKey="platform"
          innerRadius={60}
          strokeWidth={5}
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
                      {`${getMsPlayedInHours(totalListings, false)}h`}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Hours listened
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
