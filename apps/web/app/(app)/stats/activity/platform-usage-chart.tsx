"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { getMsPlayedInHours } from "~/lib/utils";

import { getMonthlyPlatformData } from "./get-data";

type Data = NonNullable<Awaited<ReturnType<typeof getMonthlyPlatformData>>>;

type PlatformUsageChartProps = {
  data: Data;
};

const chartConfig = {
  web: {
    label: "Web",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const msToHours = (ms: number) => ms / 1000 / 60 / 60;

export function PlatformUsageChart({
  data: chartData,
}: PlatformUsageChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-5">
          <CardTitle>Platform Usage Over Time</CardTitle>
          <CardDescription>Showing platform usage statistics</CardDescription>
        </div>
        <div className="flex flex-col justify-center border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-6 sm:py-0">
          <span className="text-xs text-muted-foreground">
            Most used platform is{" "}
            <span className="font-medium">
              {chartData.mostUsedPlatform.platform.charAt(0).toUpperCase() +
                chartData.mostUsedPlatform.platform.slice(1)}
            </span>
            {" with"}
          </span>
          <span className="text-lg font-bold leading-none sm:text-xl">
            <NumberFlow
              value={msToHours(chartData.mostUsedPlatform.value).toFixed(2)}
              suffix=" hours"
            />
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-[10/3] size-full"
        >
          <AreaChart data={chartData.data}>
            <defs>
              <linearGradient id="fillWeb" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-web)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-web)"
                  stopOpacity={0.3}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.3}
                />
              </linearGradient>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.3}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return getMsPlayedInHours(value.toString(), false) + "h";
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                  formatter={(value, name, item) => (
                    <div>
                      <div className="flex items-center gap-1">
                        <div
                          className="size-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                          style={
                            {
                              "--color-bg": `var(--color-${item.dataKey})`,
                            } as React.CSSProperties
                          }
                        />
                        <div className="font-normal">{name}</div>
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
                  indicator="dot"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="web"
              stackId="1"
              stroke="var(--color-web)"
              fill="url(#fillWeb)"
            />
            <Area
              type="monotone"
              dataKey="mobile"
              stackId="1"
              stroke="var(--color-mobile)"
              fill="url(#fillMobile)"
            />
            <Area
              type="monotone"
              dataKey="desktop"
              stackId="1"
              stroke="var(--color-desktop)"
              fill="url(#fillDesktop)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
