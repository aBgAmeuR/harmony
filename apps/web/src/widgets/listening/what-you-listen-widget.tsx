import {
  Chart,
  barY,
  chartBase,
  colors,
  columnBand,
  columnTooltip,
  decorative,
  defineChart,
  ruleX,
  scaleLinear,
  text,
  xBand,
} from "@harmony/charts/v4";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { GenreSegment, ReleaseYearPoint } from "@/data/listening/types";

import { DataFigure } from "@/features/data-figure";
import { seriesOf } from "@/shared/lib/chart-series";
import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";
import { format } from "@/utils/format";

import { listeningQueries } from "./api";
import { SectionPending } from "./ui/section-pending";

const SERIES = seriesOf("streams");
const NO_YEARS: ReleaseYearPoint[] = [];
const NO_GENRES: GenreSegment[] = [];
const percent = (value: number) => format.as(value, "percent");

const YEAR_VIEWS = [
  { value: "years", label: "Years" },
  { value: "decades", label: "Decades" },
];

// The busiest years are drawn bright.
const BRIGHT_YEARS = 4;
const BRIGHT = "var(--chart-1)";
const DIM = "var(--chart-4)";
// Room above the tallest bar for the median label.
const HEADROOM = 1.15;
// On long spans, the oldest years up to this share of the plays join one "Older" bar.
const OLDER_SHARE = 0.03;
const OLDER = "Older";
// Years kept apart from "Older", at least.
const MIN_YEARS = 12;

// Every year from the oldest to the newest, so gaps show as empty columns.
const fillYears = (rows: ReleaseYearPoint[]): ReleaseYearPoint[] => {
  const byYear = new Map(rows.map((row) => [Number(row.name), row]));
  const years = [...byYear.keys()];
  if (years.length === 0) return [];
  const first = Math.min(...years);
  const last = Math.max(...years);
  return Array.from({ length: last - first + 1 }, (_, i) => ({
    name: String(first + i),
    value: byYear.get(first + i)?.value ?? 0,
    album: byYear.get(first + i)?.album ?? null,
  }));
};

// Folds the long tail of old years into one "Older" bar, so the busy years get the room.
const foldOlder = (years: ReleaseYearPoint[]): ReleaseYearPoint[] => {
  if (years.length <= MIN_YEARS + 4) return years;
  const total = years.reduce((sum, year) => sum + year.value, 0);
  let seen = 0;
  let cut = 0;
  while (cut < years.length - MIN_YEARS) {
    const next = seen + (years[cut]?.value ?? 0);
    if (next > total * OLDER_SHARE) break;
    seen = next;
    cut += 1;
  }
  if (cut === 0) return years;
  return [{ name: OLDER, value: seen, album: null }, ...years.slice(cut)];
};

const decadeOf = (year: string) => `${Math.floor(Number(year) / 10) * 10}s`;

// Streams summed by decade, "1990s".
const toDecades = (years: ReleaseYearPoint[]): ReleaseYearPoint[] => {
  const byDecade = new Map<string, number>();
  for (const year of years) {
    const decade = decadeOf(year.name);
    byDecade.set(decade, (byDecade.get(decade) ?? 0) + year.value);
  }
  return [...byDecade].map(([name, value]) => ({ name, value, album: null }));
};

// The newest year such that half of the plays are of music released that year or later.
const halfSince = (years: ReleaseYearPoint[]): string | undefined => {
  const total = years.reduce((sum, year) => sum + year.value, 0);
  let seen = 0;
  for (const year of [...years].reverse()) {
    seen += year.value;
    if (seen * 2 >= total) return year.name;
  }
  return undefined;
};

type YearBar = ReleaseYearPoint & { bright: boolean };

type ReleaseChartProps = { years: ReleaseYearPoint[]; median?: string; decades: boolean };

// Bars by year or decade, the busiest ones bright, with the median year marked.
const ReleaseChart = ({ years, median, decades }: ReleaseChartProps) => {
  const definition = useMemo(() => {
    const bars = decades ? toDecades(years) : foldOlder(years);
    const names = bars.map((bar) => bar.name);
    const busiest = new Set(
      bars
        .filter((bar) => bar.value > 0 && bar.name !== OLDER)
        .toSorted((a, b) => b.value - a.value)
        .slice(0, decades ? 1 : BRIGHT_YEARS)
        .map((bar) => bar.name),
    );
    const rows = bars.map((bar): YearBar => ({ ...bar, bright: busiest.has(bar.name) }));
    const top = Math.max(0, ...rows.map((row) => row.value)) * HEADROOM || 1;
    const mark = median && (decades ? decadeOf(median) : median);
    // Every year on short spans, then every fifth or tenth.
    const every = names.length > 30 ? 10 : names.length > 16 ? 5 : 1;
    const ticks = decades
      ? names
      : names.filter((name) => name === OLDER || Number(name) % every === 0);
    const x = xBand(
      names.length > 0
        ? {
            values: ticks,
            format: (name: string) => (decades || name === OLDER ? name : `'${name.slice(2)}`),
          }
        : undefined,
      names,
    );
    // The median label sits on the roomier side of its line.
    const late = mark !== undefined && names.indexOf(mark) > names.length / 2;
    const albums = new Map(rows.map((row) => [row.name, row.album]));

    return defineChart({
      ...chartBase,
      marks: [
        barY(rows, {
          id: "bars",
          x: "name",
          y: "value",
          z: () => "streams",
          fill: (row) => (row.bright ? BRIGHT : DIM),
          radius: [3, 3, 0, 0],
        }),
        columnBand(),
        ...(mark
          ? [
              decorative(
                ruleX([mark], {
                  id: "median",
                  stroke: colors.muted,
                  strokeDasharray: "3 4",
                  strokeOpacity: 0.7,
                }),
              ),
              decorative(
                text([{ name: mark, value: top }], {
                  id: "median-label",
                  x: "name",
                  y: "value",
                  text: () => `Median ${median}`,
                  anchor: late ? "end" : "start",
                  dx: late ? -4 : 4,
                  dy: 10,
                  fontSize: 10,
                  fill: colors.muted,
                }),
              ),
            ]
          : []),
      ],
      scales: {
        x: {
          ...x,
          axis: {
            ...x.axis,
            tickLabels: {
              ...x.axis.tickLabels,
              fontWeight: ({ value }) => (value === mark ? 600 : undefined),
            },
          },
        },
        y: { scale: scaleLinear().domain([0, top]), axis: false },
      },
      // The tooltip names the top album of the inspected year.
      ...columnTooltip(SERIES, { title: (name) => albums.get(name) ?? name }),
    });
  }, [years, median, decades]);

  return (
    <Chart
      definition={definition}
      ariaLabel={decades ? "Streams by release decade" : "Streams by release year"}
      aspectRatio={3}
    />
  );
};

type GenreSlice = { key: string; label: string; share: number; paint: string };

// Above this share, the top genre gets its own bar and the others are enlarged below it.
const ZOOM_FROM = 0.6;
// Paint of each genre from the most played, then of the genres outside the top five.
const GENRE_PAINT = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
const OTHER_PAINT = "bg-muted-foreground/40";

// Flex weight of a slice within its group, so the group fills its bar whatever its total.
const weight = (slice: GenreSlice, slices: GenreSlice[]) => {
  const total = slices.reduce((sum, item) => sum + item.share, 0);
  return total > 0 ? slice.share / total : 0;
};

type GenreBarProps = {
  slices: GenreSlice[];
  hovered: string | null;
  onHover: (key: string | null) => void;
};

// Genres as one bar of segments, each named below its segment with its share of all plays.
const GenreBar = ({ slices, hovered, onHover }: GenreBarProps) => (
  <div className="flex gap-0.5">
    {slices.map((slice, i) => (
      <div
        key={slice.key}
        className={cn(
          "flex min-w-12 flex-col gap-1.5 transition-opacity",
          hovered !== null && hovered !== slice.key && "opacity-40",
        )}
        style={{ flex: `${weight(slice, slices)} 1 0%` }}
        onMouseEnter={() => onHover(slice.key)}
        onMouseLeave={() => onHover(null)}
      >
        <span
          aria-hidden
          className={cn(
            "h-8 rounded-sm",
            i === 0 && "rounded-l-md",
            i === slices.length - 1 && "rounded-r-md",
            slice.paint,
          )}
        />
        <span className="truncate text-xs font-medium">{slice.label}</span>
        <span className="-mt-1 text-[10px] text-muted-foreground tabular-nums">
          {percent(slice.share)}
        </span>
      </div>
    ))}
  </div>
);

// The top genres. When the first one takes most of the plays, it gets the whole bar and the
// others, drawn small at its end, are enlarged below. Every share is of all plays.
const Genres = ({ genres }: { genres: GenreSegment[] }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const rest = Math.max(0, 1 - genres.reduce((sum, genre) => sum + genre.share, 0));
  const slices: GenreSlice[] = [
    ...genres.map((genre, i) => ({
      key: genre.key,
      label: genre.label,
      share: genre.share,
      paint: GENRE_PAINT[i] ?? OTHER_PAINT,
    })),
    ...(rest >= 0.001
      ? [{ key: "other", label: "Other genres", share: rest, paint: OTHER_PAINT }]
      : []),
  ];
  const [top, ...others] = slices;
  const zoom = top !== undefined && top.share >= ZOOM_FROM && others.length > 0;
  const remaining = 1 - (top?.share ?? 0);
  const dim = (key: string) => hovered !== null && hovered !== key;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex min-h-7 items-center justify-between gap-2 text-sm text-muted-foreground">
        Genres
        {zoom ? (
          <span className="text-xs">The other {percent(remaining)}, enlarged below</span>
        ) : null}
      </figcaption>
      {zoom && top ? (
        <>
          <div className="flex h-8 gap-0.5">
            <div
              className={cn(
                "flex min-w-0 items-center justify-between gap-2 rounded-l-md px-3 text-xs font-medium text-background transition-opacity",
                top.paint,
                dim(top.key) && "opacity-40",
              )}
              style={{ flex: `${top.share} 1 0%` }}
              onMouseEnter={() => setHovered(top.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="truncate">{top.label}</span>
              <span className="tabular-nums">{percent(top.share)}</span>
            </div>
            {/* The other genres in miniature, painted like their enlarged segments below. */}
            <div
              className="flex min-w-2 gap-px overflow-hidden rounded-r-md"
              style={{ flex: `${remaining} 1 0%` }}
            >
              {others.map((slice) => (
                <span
                  key={slice.key}
                  aria-hidden
                  className={cn(
                    "min-w-px transition-opacity",
                    slice.paint,
                    dim(slice.key) && "opacity-40",
                  )}
                  style={{ flex: `${weight(slice, others)} 1 0%` }}
                />
              ))}
            </div>
          </div>
          {/* Lines from the miniature to the enlarged bar. */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="-my-1.5 h-7 w-full"
          >
            <polygon
              points={`${top.share * 100},0 100,0 100,100 0,100`}
              className="fill-foreground/5"
            />
            <line
              x1={top.share * 100}
              y1="0"
              x2="0"
              y2="100"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="3 3"
              className="stroke-muted-foreground/50"
            />
            <line
              x1="100"
              y1="0"
              x2="100"
              y2="100"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="3 3"
              className="stroke-muted-foreground/50"
            />
          </svg>
          <GenreBar slices={others} hovered={hovered} onHover={setHovered} />
        </>
      ) : (
        <GenreBar slices={slices} hovered={hovered} onHover={setHovered} />
      )}
    </figure>
  );
};

// When the music you play came out, and its genres.
export const WhatYouListenWidget = () => {
  const filter = useScope();
  const { data: rows = NO_YEARS, isPending: yearsPending } = useQuery(
    listeningQueries.releaseYear.queryOptions(filter),
  );
  const { data: genres = NO_GENRES, isPending: genresPending } = useQuery(
    listeningQueries.genres.queryOptions(filter),
  );

  const years = useMemo(() => fillYears(rows), [rows]);
  const since = halfSince(years);
  const genre = genres[0];

  if (yearsPending || genresPending) {
    return (
      <SectionPending title="What you listen to">
        <Skeleton className="aspect-[2.6] rounded-lg" />
        <Skeleton className="mt-5 h-36 rounded-lg" />
      </SectionPending>
    );
  }

  return (
    <Section size="md">
      <Section.Title>What you listen to</Section.Title>
      <Section.Text>
        {since ? (
          <>
            Half of your plays are music released in <strong>{since}</strong> or later.
            {genre ? (
              <>
                {" "}
                Your top genre is <strong>{genre.label}</strong>, at{" "}
                <strong>{percent(genre.share)}</strong>.
              </>
            ) : null}
          </>
        ) : (
          "No release dates for this period."
        )}
      </Section.Text>
      <div className="mt-3 flex flex-col gap-8">
        <DataFigure title="By release year" views={YEAR_VIEWS}>
          {(state) => (
            <ReleaseChart years={years} median={since} decades={state.view === "decades"} />
          )}
        </DataFigure>
        {genres.length > 0 ? <Genres genres={genres} /> : null}
      </div>
    </Section>
  );
};
