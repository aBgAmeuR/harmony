"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
import { Skeleton } from "@repo/ui/skeleton";
import { Brain } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { getMsPlayedInHours } from "~/lib/utils";
// const chartData = [
//   { subject: "Morning", time: 180006 }, // 6:00 - 12:00
//   { subject: "Noon", time: 150000 }, // 12:00 - 14:00
//   { subject: "Afternoon", time: 300005 }, // 14:00 - 18:00
//   { subject: "Early Evening", time: 230070 }, // 18:00 - 20:00
//   { subject: "Late Evening", time: 200000 }, // 20:00 - 0:00
//   { subject: "Night", time: 270003 }, // 0:00 - 6:00
// ];

const chartConfig = {
  time: {
    label: "Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type ListeningPatternChartProps = {
  data: {
    subject: any;
    time: number;
  }[];
  className?: string;
};

export function ListeningPatternChart({
  data: chartData,
  className,
}: ListeningPatternChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Listening Patterns
        </CardTitle>
        <Brain className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-0 max-h-56 md:max-h-52 lg:max-h-64 xl:max-h-80 2xl:max-h-[350px] size-full">
        <ChartContainer
          config={chartConfig}
          className="mx-auto size-full aspect-square w-56 md:w-52 lg:w-64 xl:w-80 2xl:w-[350px]"
        >
          <RadarChart
            data={chartData}
            margin={{ top: 18, right: 18, bottom: 18, left: 18 }}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        <NumberFlow
                          value={getMsPlayedInHours(value.toString())}
                        />
                        <span className="font-normal text-muted-foreground">
                          hours
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <PolarAngleAxis dataKey="subject" width={50} />
            <PolarGrid />
            <Radar
              dataKey="time"
              fill="var(--color-time)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const ListeningPatternChartSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Listening Patterns
        </CardTitle>
        <Brain className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="max-h-56 md:max-h-52 lg:max-h-64 xl:max-h-80 2xl:max-h-[350px] size-full ">
        <div className="mx-auto w-56 md:w-52 lg:w-64 xl:w-80 2xl:w-[350px] aspect-square ">
          <div className="size-full pb-6">
            <Skeleton className="size-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
