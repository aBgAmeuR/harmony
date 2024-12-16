"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
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
      className="mx-auto aspect-square min-w-60 w-full"
    >
      <PieChart margin={{ top: -10, left: -10, right: -10, bottom: -10 }}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => (
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{item.payload.platform}</div>
                  <div className="flex items-center gap-1">
                    <div
                      className="size-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                      style={
                        {
                          "--color-bg": item.payload?.fill,
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
        />
        <Pie
          data={colorData(chartData)}
          dataKey="msPlayed"
          nameKey="platform"
          innerRadius={70}
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
