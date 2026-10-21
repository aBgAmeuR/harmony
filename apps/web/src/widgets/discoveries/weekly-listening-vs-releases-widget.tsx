import {
  Chart,
  areaY,
  brushX,
  chartBase,
  colors,
  columnGuide,
  columnTooltip,
  controlledSignal,
  curves,
  decorative,
  defineChart,
  fadeGradient,
  lineY,
  ruleX,
  text,
  xPoint,
  yValue,
  type BrushRange,
  type BrushXChange,
} from "@harmony/charts/v4";
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
import { useMemo, useState } from "react";

import type { ArtistRelease, WeeklyActivityPoint } from "@/data/discoveries/types";

import { artistQueries } from "@/entities/artist";
import { ArtistsSelect } from "@/features/pick-artist";
import { seriesOf } from "@/shared/lib/chart-series";
import { useScope } from "@/shared/scope";

import { discoveryQueries } from "./api";

const SERIES = seriesOf("playtime");
// Stable empty lists, so charts are not rebuilt while the queries load.
const NO_WEEKS: WeeklyActivityPoint[] = [];
const NO_RELEASES: ArtistRelease[] = [];

const shortTitle = (album: string) =>
  album.length > 22 ? `${album.slice(0, 20).trimEnd()}…` : album;

type ChartProps = {
  weekly: WeeklyActivityPoint[];
  releases: ArtistRelease[];
};

// Weeks shown in the main chart, picked with the brush of the overview below it.
const useWeekRange = (weeks: readonly string[]) => {
  const [picked, setPicked] = useState<BrushRange<string> | null>(null);
  const range = useMemo(() => {
    // a range from another artist or period falls back to every week
    if (picked && weeks.includes(picked.start) && weeks.includes(picked.end)) return picked;
    return { start: weeks[0] ?? "", end: weeks.at(-1) ?? "" };
  }, [picked, weeks]);
  return [range, setPicked] as const;
};

const ListeningVsReleasesChart = ({ weekly, releases }: ChartProps) => {
  const weeks = useMemo(() => weekly.map((week) => week.name), [weekly]);
  const [range, setRange] = useWeekRange(weeks);

  const detail = useMemo(() => {
    const from = weeks.indexOf(range.start);
    const to = weeks.indexOf(range.end);
    const rows = weekly.slice(Math.min(from, to), Math.max(from, to) + 1);
    const shown = new Set(rows.map((row) => row.name));
    const marks = releases.filter((release) => shown.has(release.periodLabel));
    const top = Math.max(0, ...rows.map((row) => row.value));

    return defineChart({
      ...chartBase,
      marks: [
        decorative(
          areaY(rows, {
            id: "area",
            x: "name",
            y: "value",
            fill: "url(#weekly-fade)",
            curve: curves.monotone,
          }),
        ),
        lineY(rows, {
          id: "weekly",
          x: "name",
          y: "value",
          z: () => "playtime",
          curve: curves.monotone,
          strokeWidth: 1.5,
        }),
        // one dashed rule per album release, titled along its top
        decorative(
          ruleX(marks, {
            id: "releases",
            x: "periodLabel",
            stroke: "var(--chart-3)",
            strokeOpacity: 0.75,
            strokeDasharray: "4 4",
          }),
        ),
        decorative(
          text(marks, {
            id: "release-titles",
            x: "periodLabel",
            y: () => top,
            text: (release) => shortTitle(release.album),
            rotate: -90,
            anchor: "end",
            dx: -4,
            fontSize: 10,
            fontWeight: 500,
            fill: colors.muted,
          }),
        ),
        columnGuide(),
      ],
      scales: { x: xPoint(), y: { ...yValue(), axis: false } },
      gradients: [fadeGradient("weekly-fade", colors.primary)],
      ...columnTooltip(SERIES),
    });
  }, [weekly, releases, weeks, range]);

  const overview = useMemo(
    () =>
      defineChart({
        ...chartBase,
        marks: [
          areaY(weekly, {
            id: "overview",
            x: "name",
            y: "value",
            fill: colors.primary,
            fillOpacity: 0.2,
            curve: curves.monotone,
          }),
        ],
        scales: { x: xPoint(), y: yValue() },
        guides: false,
        margin: 0,
        // the brush needs weeks to pick from: none while loading or without data
        controls:
          weeks.length < 2
            ? []
            : [
                brushX({
                  range: controlledSignal<BrushRange<string>, BrushXChange<string>>(
                    range,
                    (next, { reason }) => {
                      if (reason.type === "commit") setRange(next);
                    },
                  ),
                  values: weeks,
                  ariaLabel: "Weeks shown above",
                  startAriaLabel: "First week",
                  endAriaLabel: "Last week",
                }),
              ],
      }),
    [weekly, weeks, range, setRange],
  );

  return (
    <div className="flex flex-col gap-2">
      <Chart
        definition={detail}
        ariaLabel="Weekly listening time with album releases"
        aspectRatio={3}
      />
      <Chart definition={overview} ariaLabel="Pick the weeks to show" height={48} />
    </div>
  );
};

const SelectArtistOverlay = () => {
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
};

export const WeeklyListeningVsReleasesWidget = () => {
  const filter = useScope();
  const hasArtist = filter.artistId != null;

  const { data: artists = [] } = useQuery({
    ...artistQueries.top.queryOptions(filter),
    enabled: !hasArtist,
  });
  const artistId = filter.artistId ?? artists[0]?.id;

  const { data: weekly = NO_WEEKS } = useQuery(
    discoveryQueries.weeklyActivity.queryOptions({ ...filter, artistId }),
  );
  const { data: releases = NO_RELEASES } = useQuery(
    discoveryQueries.artistReleases.queryOptions({ ...filter, artistId }),
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
};
