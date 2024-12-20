"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { NumberFlow } from "@repo/ui/number";
import { Skeleton } from "@repo/ui/skeleton";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { getFirstTimeListenedData } from "./get-data";

type Data = NonNullable<Awaited<ReturnType<typeof getFirstTimeListenedData>>>;

type FirstTimeEvolutionChartsProps = {
  data: Data;
};

const renderLineChart = (
  data: any,
  color: string,
  syncId: string,
  tooltipLabel: string,
) => (
  <ChartContainer
    config={{
      value: {
        label: "value",
        color,
      },
    }}
    className="aspect-video size-full"
  >
    <LineChart accessibilityLayer data={data} syncId={syncId}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip
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
                  <div className="font-normal">{tooltipLabel}</div>
                  <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                    <NumberFlow value={value.toString()} />
                  </div>
                </div>
              </div>
            )}
          />
        }
        cursor={false}
      />
      <Line
        dataKey="value"
        type="linear"
        stroke="var(--color-value)"
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ChartContainer>
);

export function FirstTimeEvolutionCharts({
  data: chartData,
}: FirstTimeEvolutionChartsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tracks Evolution</CardTitle>
          <CardDescription>
            Evolution of tracks listened to for the first time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderLineChart(
            chartData.tracks.data,
            "hsl(var(--chart-1))",
            "first-time-evolution",
            "Tracks",
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Albums Evolution</CardTitle>
          <CardDescription>
            Evolution of albums listened to for the first time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderLineChart(
            chartData.albums.data,
            "hsl(var(--chart-2))",
            "first-time-evolution",
            "Albums",
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Artists Evolution</CardTitle>
          <CardDescription>
            Evolution of artists listened to for the first time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderLineChart(
            chartData.artists.data,
            "hsl(var(--chart-3))",
            "first-time-evolution",
            "Artists",
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const FirstTimeEvolutionChartsSkeleton = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tracks Evolution</CardTitle>
          <CardDescription>
            Evolution of tracks listened to for the first time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Albums Evolution</CardTitle>
          <CardDescription>
            Evolution of albums listened to for the first time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Artists Evolution</CardTitle>
          <CardDescription>
            Evolution of artists listened to for the first time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video" />
        </CardContent>
      </Card>
    </div>
  );
};
