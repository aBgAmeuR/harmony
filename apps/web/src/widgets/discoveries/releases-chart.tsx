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
import { useMemo, useState } from "react";

import type { ArtistRelease, WeeklyActivityPoint } from "@/data/discoveries/types";

import { seriesOf } from "@/shared/lib/chart-series";

const SERIES = seriesOf("playtime");

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

// The weekly line with a dashed rule on each release that falls in those weeks.
const releasesDefinition = (rows: WeeklyActivityPoint[], releases: ArtistRelease[]) => {
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
};

type ReleasesLineProps = ChartProps & { aspectRatio?: number };

// The weekly line and its release rules alone, without the brush.
export const ReleasesLine = ({ weekly, releases, aspectRatio = 3 }: ReleasesLineProps) => {
  const definition = useMemo(() => releasesDefinition(weekly, releases), [weekly, releases]);
  return (
    <Chart
      definition={definition}
      ariaLabel="Weekly listening time with album releases"
      aspectRatio={aspectRatio}
    />
  );
};

// An artist's weekly listening with a dashed rule on each album release, and a brush to zoom.
export const ListeningVsReleasesChart = ({ weekly, releases }: ChartProps) => {
  const weeks = useMemo(() => weekly.map((week) => week.name), [weekly]);
  const [range, setRange] = useWeekRange(weeks);

  const detail = useMemo(() => {
    const from = weeks.indexOf(range.start);
    const to = weeks.indexOf(range.end);
    return releasesDefinition(weekly.slice(Math.min(from, to), Math.max(from, to) + 1), releases);
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
