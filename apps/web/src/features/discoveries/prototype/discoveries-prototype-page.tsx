import type { ComponentProps } from "react";

import { AreaChart } from "@harmony/charts/v3";
import { Card, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { useArtistStore } from "@/lib/stores/artist-store";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

import { discoveriesPrototypeQueries } from "./queries";

function WeeklyListeningVsReleases() {
  const artist = useArtistStore((s) => s.artist);
  const artistId = artist?.id;
  const { from, to } = useInstantRangeQuery();

  const { data: weekly = [], isLoading: weeklyLoading } = useQuery({
    ...discoveriesPrototypeQueries.weeklyActivity.queryOptions({
      artistId: artistId ?? 0,
      from,
      to,
    }),
    enabled: artistId != null,
  });

  const { data: releases = [], isLoading: releasesLoading } = useQuery({
    ...discoveriesPrototypeQueries.artistReleases.queryOptions({
      artistId: artistId ?? 0,
      from,
      to,
    }),
    enabled: artistId != null,
  });

  if (artistId == null || artist == null) {
    return (
      <Card size="sm">
        <CardHeader className="px-3 pt-3">
          <CardTitle className="text-sm">Weekly listening vs releases</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 text-sm text-muted-foreground">
          Pick an artist in the header to plot weekly listening against their album releases.
        </CardContent>
      </Card>
    );
  }

  const loading = weeklyLoading || releasesLoading;
  const weekNames = new Set(weekly.map((m) => m.name));
  const chartReleases = releases.filter((r) => weekNames.has(r.periodLabel));

  const markLine = {
    symbol: ["none", "none"],
    silent: false,
    animation: false,
    lineStyle: {
      color: "#28783e",
      type: "dashed",
      width: 1,
      opacity: 0.75,
    },
    label: {
      show: true,
      position: "insideEndTop",
      distance: 4,
    },
    data: chartReleases.map((r) => {
      const raw = r.album.length > 22 ? `${r.album.slice(0, 20).trimEnd()}…` : r.album;
      const title = raw.replace(/[{}|]/g, "");
      return {
        name: r.album,
        xAxis: r.periodLabel,
        label: {
          formatter: () => (r.image ? `{img|}  {title|${title}}` : `{title|${title}}`),
          rich: {
            ...(r.image
              ? {
                  img: {
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: { image: r.image },
                  },
                }
              : {}),
            title: {
              color: "#D9D9D9",
              fontSize: 10,
              fontWeight: 500,
              lineHeight: 14,
            },
          },
        },
      };
    }),
  } satisfies ComponentProps<typeof AreaChart.Area>["markLine"];

  return (
    <Card size="sm" className="pb-0.5">
      <CardHeader>
        <CardTitle>Weekly listening vs releases</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="aspect-3/1 animate-pulse rounded-md bg-muted/40" />
        ) : (
          <AreaChart
            className="aspect-3/1"
            data={weekly}
            config={{
              value: {
                label: "Time",
                colors: {
                  light: ["#1db954"],
                },
              },
            }}
          >
            <AreaChart.Area
              dataKey="value"
              variant="solid"
              strokeVariant="solid"
              strokeWidth={1.5}
              markLine={chartReleases.length > 0 ? markLine : undefined}
            />
            <AreaChart.XAxis dataKey="name" />
            <AreaChart.Tooltip suffix="min" />
            <AreaChart.Grid />
            <AreaChart.Brush height={48} />
          </AreaChart>
        )}
      </CardContent>
    </Card>
  );
}

export function DiscoveriesPrototypePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-3 p-4 pt-0 pb-8">
      <WeeklyListeningVsReleases />
    </main>
  );
}
