"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { Label, Pie, PieChart } from "recharts";

import { getMsPlayedInHours } from "~/lib/utils";

import { getTopPlatforms } from "./get-charts-data";

const chartConfig = {
  // msPlayed: {
  //   label: "Listening Time",
  //   color: "hsl(var(--chart-2))",
  // },
} satisfies ChartConfig;

type Data = Awaited<ReturnType<typeof getTopPlatforms>>;

type TopPlatformChartProps = {
  data: Data;
};

const colorData = (data: Data) => {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return data?.map((item, index) => ({
    ...item,
    fill: colors[index],
  }));
};

export const TopPlatformChart = ({
  data: chartData,
}: TopPlatformChartProps) => {
  if (!chartData) return null;

  const totalListings = chartData.reduce(
    (total, { msPlayed }) => total + msPlayed,
    0,
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
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
