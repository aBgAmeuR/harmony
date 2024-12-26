"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
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
};

export function ListeningPatternChart({
  data: chartData,
}: ListeningPatternChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Listening Patterns
        </CardTitle>
        <Brain className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square">
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
