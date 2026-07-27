import type { ComponentProps } from "react";

import { AreaChart } from "@harmony/charts/v3";
import { Icon, UserIcon } from "@harmony/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@harmony/ui/components/empty";
import { useQuery } from "@tanstack/react-query";

import type { ArtistRelease, WeeklyActivityPoint } from "@/features/discoveries/types";

import { ArtistsSelect } from "@/components/layout/header/artists-select";
import { useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

function buildReleaseMarkLine(releases: ArtistRelease[]) {
  return {
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
    data: releases.map((r) => {
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
}

function ListeningVsReleasesChart({
  weekly,
  releases,
}: {
  weekly: WeeklyActivityPoint[];
  releases: ArtistRelease[];
}) {
  const weekNames = new Set(weekly.map((m) => m.name));
  const chartReleases = releases.filter((r) => weekNames.has(r.periodLabel));
  const markLine = chartReleases.length > 0 ? buildReleaseMarkLine(chartReleases) : undefined;

  return (
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
        markLine={markLine}
      />
      <AreaChart.XAxis dataKey="name" />
      <AreaChart.Tooltip suffix="min" />
      <AreaChart.Grid />
      <AreaChart.Brush height={48} />
    </AreaChart>
  );
}

function SelectArtistOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/25 backdrop-blur-xs">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon={UserIcon} />
          </EmptyMedia>
          <EmptyTitle>Select an artist</EmptyTitle>
          <EmptyDescription>
            Choose an artist to plot weekly listening against their album releases.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ArtistsSelect
            placeholder="Select an artist"
            className="ms-0! border border-border bg-muted px-2.5 hover:bg-secondary"
          />
        </EmptyContent>
      </Empty>
    </div>
  );
}

export function WeeklyListeningVsReleasesWidget() {
  const filter = useFilter();
  const hasArtist = filter.artistId != null;

  const { data: artists = [] } = useQuery({
    ...query.artists.top.queryOptions(filter),
    enabled: !hasArtist,
  });
  const artistId = filter.artistId ?? artists[0]?.id;

  const { data: weekly = [] } = useQuery(
    query.discoveries.weeklyActivity.queryOptions({ ...filter, artistId }),
  );
  const { data: releases = [] } = useQuery(
    query.discoveries.artistReleases.queryOptions({ ...filter, artistId }),
  );

  return (
    <Card size="sm" className="pb-0.5">
      <CardHeader>
        <CardTitle>Weekly listening vs releases</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className={!hasArtist ? "pointer-events-none opacity-40 select-none" : undefined}>
          <ListeningVsReleasesChart weekly={weekly} releases={releases} />
        </div>
        {!hasArtist && <SelectArtistOverlay />}
      </CardContent>
    </Card>
  );
}
