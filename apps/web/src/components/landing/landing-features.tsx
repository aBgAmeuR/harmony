import type { ReactNode } from "react";

import { Area, AreaChart, ChartTooltip } from "@harmony/charts/v2";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { ButtonGroup } from "@harmony/ui/components/button-group";
import { cn } from "@harmony/ui/lib/utils";

import { CatalogTrendSparkline } from "../catalog/catalog-trend-sparkline";
import { Cover } from "../cover";
import { Metric } from "../metric";
import { useStaggerReveal } from "./use-stagger-reveal";

const data = [
  { name: "Jan", "Artist 1": 377, "Artist 2": 205, "Artist 3": 97 },
  { name: "Feb", "Artist 1": 453, "Artist 2": 222, "Artist 3": 120 },
  { name: "Mar", "Artist 1": 545, "Artist 2": 266, "Artist 3": 141 },
  { name: "Apr", "Artist 1": 541, "Artist 2": 230, "Artist 3": 134 },
  { name: "May", "Artist 1": 662, "Artist 2": 328, "Artist 3": 127 },
  { name: "Jun", "Artist 1": 703, "Artist 2": 368, "Artist 3": 190 },
  { name: "Jul", "Artist 1": 829, "Artist 2": 484, "Artist 3": 155 },
  { name: "Aug", "Artist 1": 796, "Artist 2": 512, "Artist 3": 202 },
  { name: "Sep", "Artist 1": 910, "Artist 2": 458, "Artist 3": 173 },
  { name: "Oct", "Artist 1": 980, "Artist 2": 554, "Artist 3": 165 },
  { name: "Nov", "Artist 1": 1010, "Artist 2": 480, "Artist 3": 211 },
  { name: "Dec", "Artist 1": 1023, "Artist 2": 661, "Artist 3": 345 },
];

type PodiumEntry = {
  rank: number;
  name: string;
  minutes: number;
  image: string;
  pedestal: string;
};

/** Ordered for the podium: silver, gold (center, tallest), bronze. */
const PODIUM: readonly PodiumEntry[] = [
  {
    rank: 2,
    name: "Whole Lotta Red",
    minutes: 964,
    image:
      "https://cdn-images.dzcdn.net/images/cover/3c5f5f3f5f41ff96f961afd7df7eb4d9/56x56-000000-80-0-0.jpg",
    pedestal: "h-9",
  },
  {
    rank: 1,
    name: "Rodeo",
    minutes: 1190,
    image:
      "https://cdn-images.dzcdn.net/images/cover/c6fe182fb0f3485428906c7b21873046/56x56-000000-80-0-0.jpg",
    pedestal: "h-13",
  },
  {
    rank: 3,
    name: "Playboi Carti",
    minutes: 939,
    image:
      "https://cdn-images.dzcdn.net/images/cover/0ae8e05f734268cbe5aae06f96f2b1f2/56x56-000000-80-0-0.jpg",
    pedestal: "h-7",
  },
];

const HOURLY_INTENSITY: readonly number[] = [
  0.03, 0.015, 0.01, 0.0, 0.01, 0.08, 0.09, 0.11, 0.17, 0.18, 0.19, 0.2, 0.22, 0.23, 0.25, 0.28,
  0.31, 0.34, 0.37, 0.29, 0.23, 0.24, 0.19, 0.12,
];

type GenreSegment = { label: string; pct: number; opacity: number };

const GENRE_SEGMENTS: readonly GenreSegment[] = [
  { label: "Hip-Hop", pct: 40, opacity: 1 },
  { label: "Pop", pct: 22, opacity: 0.72 },
  { label: "Rock", pct: 16, opacity: 0.52 },
  { label: "Electronic", pct: 12, opacity: 0.36 },
  { label: "Other", pct: 10, opacity: 0.14 },
];

type FilterMatch = { name: string; minutes: number; sparkline: number[]; image: string };

const FILTER_ARTIST = {
  name: "PBC",
  image:
    "https://cdn-images.dzcdn.net/images/artist/b90097972a60d9d8598a79a786be1a3a/56x56-000000-80-0-0.jpg",
  range: "2024-2025",
} as const;

const FILTER_MATCHES: readonly FilterMatch[] = [
  {
    name: "New Tank",
    minutes: 612.3,
    sparkline: [3, 5, 2, 5, 6],
    image:
      "https://cdn-images.dzcdn.net/images/cover/3c5f5f3f5f41ff96f961afd7df7eb4d9/56x56-000000-80-0-0.jpg",
  },
  {
    name: "Let It Go",
    minutes: 428.7,
    sparkline: [2, 6, 6, 8, 0],
    image:
      "https://cdn-images.dzcdn.net/images/cover/0ae8e05f734268cbe5aae06f96f2b1f2/56x56-000000-80-0-0.jpg",
  },
];

function FeatureCard({
  title,
  description,
  visual,
  className,
}: {
  title: string;
  description: string;
  visual: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex-items-center justify-center rounded-2xl p-1 shadow-[0_0_0_1px_#ffffff14]",
        className,
      )}
    >
      <div className="h-full overflow-hidden rounded-xl border border-[#ffffff14] bg-card">
        {visual}
        <div className="flex flex-col gap-1 p-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </article>
  );
}

function VisualPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-38 items-center justify-center overflow-hidden border-b border-[#ffffff14]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PodiumVisual() {
  return (
    <VisualPanel className="items-end">
      <div className="mx-auto flex h-full w-full max-w-xs items-end justify-center gap-3 px-4 pt-2">
        {PODIUM.map((entry) => (
          <div key={entry.name} className="flex w-1/3 flex-col items-center gap-0.5">
            <Cover src={entry.image} alt={entry.name} size="md" />
            <p className="mt-1 max-w-full truncate text-xs font-medium text-foreground">
              {entry.name}
            </p>
            <Metric value={entry.minutes} unit="min" size="xs" className="mb-1.5" />
            <div
              className={cn(
                "flex w-full items-start justify-center rounded-t-md border border-b-0 border-[#ffffff14]/50 pt-1",
                entry.pedestal,
                entry.rank === 1 && "bg-primary/10",
                entry.rank === 2 && "bg-primary/5",
                entry.rank === 3 && "bg-primary/2.5",
              )}
            >
              <span className="text-xs font-bold">{entry.rank}</span>
            </div>
          </div>
        ))}
      </div>
    </VisualPanel>
  );
}

function TrendsVisual() {
  return (
    <VisualPanel>
      <AreaChart className="aspect-auto size-full" data={data} xDataKey="name">
        <Area dataKey="Artist 1" fill="var(--chart-1)" />
        <Area dataKey="Artist 2" fill="var(--chart-2)" />
        <Area dataKey="Artist 3" fill="var(--chart-3)" />
        <ChartTooltip suffix="min" />
      </AreaChart>
    </VisualPanel>
  );
}

function ClockDialVisual() {
  const center = 20;
  const radius = 15;
  return (
    <VisualPanel>
      <div className="pointer-events-none relative grid place-items-center py-4 select-none">
        <svg viewBox="0 0 40 40" className="size-36 text-primary" aria-hidden>
          {HOURLY_INTENSITY.map((intensity, hour) => {
            const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
            const cx = Math.round((center + radius * Math.cos(angle)) * 100) / 100;
            const cy = Math.round((center + radius * Math.sin(angle)) * 100) / 100;
            return (
              <g key={hour}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={1.2 + intensity * 1.5}
                  fill="currentColor"
                  fillOpacity={0.14 + intensity * 1.2}
                />
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute flex flex-col items-center">
          <span className="text-md font-medium text-foreground">Peak</span>
          <span className="text-xs text-primary">5:00 PM</span>
        </div>
      </div>
    </VisualPanel>
  );
}

function GenreDonutVisual() {
  const radius = 15.915;
  let offset = 0;
  return (
    <VisualPanel>
      <div className="flex items-center gap-5 px-6">
        <div className="relative grid size-28 shrink-0 place-items-center">
          <svg viewBox="0 0 40 40" className="size-28 -rotate-90 text-primary" aria-hidden>
            {GENRE_SEGMENTS.map((segment) => {
              const dash = `${segment.pct} ${100 - segment.pct}`;
              const node = (
                <circle
                  key={segment.label}
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={segment.opacity}
                  strokeWidth="6"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                />
              );
              offset += segment.pct;
              return node;
            })}
          </svg>
          <div className="pointer-events-none absolute flex flex-col items-center">
            <span className="text-sm font-bold text-foreground">40%</span>
            <span className="text-[9px] text-muted-foreground">Hip-Hop</span>
          </div>
        </div>
        <ul className="flex flex-col gap-1.5">
          {GENRE_SEGMENTS.map((segment) => (
            <li key={segment.label} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[3px] bg-primary"
                style={{ opacity: segment.opacity }}
              />
              <span className="text-[10px] text-muted-foreground">{segment.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </VisualPanel>
  );
}

function FilterVisual() {
  return (
    <VisualPanel className="flex-col items-stretch justify-center gap-3 p-4">
      <div className="flex items-center justify-between gap-1.5">
        <Button variant="outline" size="sm" tabIndex={-1} className="max-w-full gap-1.5">
          <Cover
            src={FILTER_ARTIST.image}
            alt={FILTER_ARTIST.name}
            size="sm"
            className="size-4 rounded-full"
          />
          <span className="truncate">{FILTER_ARTIST.name}</span>
          <Icon icon={Cancel01Icon} className="size-3 text-muted-foreground" />
        </Button>

        <ButtonGroup>
          <Button size="icon-sm" variant="secondary">
            <Icon icon={ArrowLeft01Icon} />
          </Button>
          <Button size="sm" variant="secondary">
            {FILTER_ARTIST.range}
          </Button>
          <Button size="icon-sm" variant="secondary">
            <Icon icon={ArrowRight01Icon} />
          </Button>
        </ButtonGroup>
      </div>

      <ul className="overflow-hidden rounded-lg border border-border">
        {FILTER_MATCHES.map((track, index) => (
          <li
            key={track.name}
            className={cn(
              "flex items-center gap-2.5 bg-background/10 px-2.5 py-2",
              index > 0 && "border-t border-border",
            )}
          >
            <Cover src={track.image} alt={track.name} size="sm" />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
              {track.name}
            </span>
            <CatalogTrendSparkline trend={track.sparkline} className="me-0.5 h-4 w-10" />
            <Metric value={track.minutes} unit="min" size="xs" />
          </li>
        ))}
      </ul>
    </VisualPanel>
  );
}

export function LandingFeatures() {
  const { ref, isShown } = useStaggerReveal<HTMLElement>();

  return (
    <section ref={ref} className="w-full pt-24 pb-12">
      <div
        className={cn(
          "t-stagger mx-auto flex w-full max-w-xl flex-col gap-8",
          isShown && "is-shown",
        )}
      >
        <header className="flex flex-col gap-2">
          <h2 className="t-stagger-line t-stagger-line--1 text-2xl font-bold tracking-tight text-balance">
            Explore every angle of your listening
          </h2>
          <div className="t-stagger-line t-stagger-line--2 flex max-w-md flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              From ranked catalogs to peak-hour dials, Harmony turns years of streams into{" "}
              <span className="text-foreground italic">playful</span>, interactive analytics.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <FeatureCard
            className="t-stagger-line t-stagger-line--3"
            title="Ranked catalogs"
            description="Your most-played tracks, artists, and albums, ranked by minutes with covers and rank badges."
            visual={<PodiumVisual />}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FeatureCard
              className="t-stagger-line t-stagger-line--4"
              title="Trends over time"
              description="Watch your listening rise and fall across months and years."
              visual={<TrendsVisual />}
            />
            <FeatureCard
              className="t-stagger-line t-stagger-line--5"
              title="Peak-hour dial"
              description="See exactly when you listen, mapped around a 24-hour clock."
              visual={<ClockDialVisual />}
            />
            <FeatureCard
              className="t-stagger-line t-stagger-line--6"
              title="Genre breakdown"
              description="Understand the shape of your taste, drawn from every stream."
              visual={<GenreDonutVisual />}
            />
            <FeatureCard
              className="t-stagger-line t-stagger-line--7"
              title="Filter by artist & date"
              description="Focus any view on one artist or range and every chart updates instantly."
              visual={<FilterVisual />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
