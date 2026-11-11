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
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { seriesOf } from "@/entities/measure";
import { DataFigure } from "@/features/data-figure";
import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";

import type { ReleaseYearPoint } from "./api";

import { listeningQueries } from "./api";
import { SectionPending } from "./ui/section-pending";

const SERIES = seriesOf("streams");
const NO_YEARS: ReleaseYearPoint[] = [];

const YEAR_VIEWS = [
  { value: "years", label: "Years" },
  { value: "decades", label: "Decades" },
];

const BRIGHT_YEARS = 4;
const BRIGHT = "var(--chart-1)";
const DIM = "var(--chart-4)";
const HEADROOM = 1.15;
// On long spans, the oldest years up to this share of the plays join one "Older" bar.
const OLDER_SHARE = 0.03;
const OLDER = "Older";
const MIN_YEARS = 12;

const fillYears = (rows: ReleaseYearPoint[]) => {
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
const foldOlder = (years: ReleaseYearPoint[]) => {
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

const toDecades = (years: ReleaseYearPoint[]) => {
  const byDecade = new Map<string, number>();
  for (const year of years) {
    const decade = decadeOf(year.name);
    byDecade.set(decade, (byDecade.get(decade) ?? 0) + year.value);
  }
  return [...byDecade].map(([name, value]) => ({ name, value, album: null }));
};

// The newest year such that half of the plays are of music released that year or later.
const halfSince = (years: ReleaseYearPoint[]) => {
  const total = years.reduce((sum, year) => sum + year.value, 0);
  let seen = 0;
  for (const year of [...years].reverse()) {
    seen += year.value;
    if (seen * 2 >= total) return year.name;
  }
  return undefined;
};

type ReleaseChartProps = { years: ReleaseYearPoint[]; median?: string; decades: boolean };

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
    const rows = bars.map((bar) => ({ ...bar, bright: busiest.has(bar.name) }));
    const top = Math.max(0, ...rows.map((row) => row.value)) * HEADROOM || 1;
    const mark = median && (decades ? decadeOf(median) : median);
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

export const ReleaseYearWidget = () => {
  const filter = useScope();
  const { data: rows = NO_YEARS, isPending } = useQuery(listeningQueries.releaseYear(filter));

  const years = useMemo(() => fillYears(rows), [rows]);
  const since = halfSince(years);

  if (isPending) {
    return (
      <SectionPending title="When it came out">
        <Skeleton className="aspect-13/5 rounded-lg" />
      </SectionPending>
    );
  }

  return (
    <Section size="md">
      <Section.Title>When it came out</Section.Title>
      <Section.Text>
        {since ? (
          <>
            Half of your plays are music released in <strong>{since}</strong> or later.
          </>
        ) : (
          "No release dates for this period."
        )}
      </Section.Text>
      <div className="mt-3">
        <DataFigure title="By release year" views={YEAR_VIEWS}>
          {(state) => (
            <ReleaseChart years={years} median={since} decades={state.view === "decades"} />
          )}
        </DataFigure>
      </div>
    </Section>
  );
};
