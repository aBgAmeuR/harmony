import type { ReactNode } from "react";

import { Area, AreaChart, Grid } from "@harmony/charts/v2";
import {
  Album02Icon,
  ArrowDown01Icon,
  Calendar03Icon,
  ChartLineData01Icon,
  FilterIcon,
  GridIcon,
  Icon,
  LayoutTable01Icon,
  RankingIcon,
  Time04Icon,
} from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

import { CatalogImage } from "@/components/catalog/catalog-image";
import { FormattedMetric } from "@/components/format/formatted-metric";

import { getRankClassName } from "../catalog/catalog-table";

type CatalogEntry = {
  rank: number;
  name: string;
  subtitle: string;
  metric: number;
  image: string;
};

const TOP_TRACKS: readonly CatalogEntry[] = [
  {
    rank: 1,
    name: "FE!N",
    subtitle: "Travis Scott, Playboi Carti",
    metric: 1190,
    image:
      "https://cdn-images.dzcdn.net/images/cover/6c91e64b7157f1332a4f6b0de9e4c714/56x56-000000-80-0-0.jpg",
  },
  {
    rank: 2,
    name: "Whole Lotta Red",
    subtitle: "Playboi Carti",
    metric: 964,
    image:
      "https://cdn-images.dzcdn.net/images/cover/3c5f5f3f5f41ff96f961afd7df7eb4d9/56x56-000000-80-0-0.jpg",
  },
  {
    rank: 3,
    name: "Let It Go",
    subtitle: "Playboi Carti",
    metric: 939,
    image:
      "https://cdn-images.dzcdn.net/images/cover/0ae8e05f734268cbe5aae06f96f2b1f2/56x56-000000-80-0-0.jpg",
  },
];

const ARTIST_IMAGE =
  "https://cdn-images.dzcdn.net/images/artist/b90097972a60d9d8598a79a786be1a3a/56x56-000000-80-0-0.jpg";

const FILTERED_TRACKS: readonly CatalogEntry[] = [
  {
    rank: 1,
    name: "Sky",
    subtitle: "Playboi Carti",
    metric: 612,
    image:
      "https://cdn-images.dzcdn.net/images/cover/3c5f5f3f5f41ff96f961afd7df7eb4d9/56x56-000000-80-0-0.jpg",
  },
  {
    rank: 2,
    name: "Let It Go",
    subtitle: "Playboi Carti",
    metric: 428,
    image:
      "https://cdn-images.dzcdn.net/images/cover/0ae8e05f734268cbe5aae06f96f2b1f2/56x56-000000-80-0-0.jpg",
  },
];

const CATALOG_TABS = ["Tracks", "Artists", "Albums"] as const;

const TREND_DATA: Array<{ name: string; value: number }> = [
  { name: "2019", value: 92 },
  { name: "2020", value: 154 },
  { name: "2021", value: 121 },
  { name: "2022", value: 188 },
  { name: "2023", value: 142 },
  { name: "2024", value: 205 },
];

/** Weekday x time-of-day intensity tiers (0 = quiet, 4 = peak). */
const HEATMAP_ROWS: ReadonlyArray<{ label: string; tiers: readonly number[] }> = [
  { label: "6a", tiers: [1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1] },
  { label: "9a", tiers: [1, 2, 2, 1, 2, 2, 3, 3, 3, 2, 2, 1] },
  { label: "12p", tiers: [2, 2, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1] },
  { label: "3p", tiers: [2, 3, 2, 3, 3, 4, 3, 3, 2, 2, 1, 0] },
];

const HEATMAP_DAYS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const;

const HEATMAP_TIER_CLASS: Record<number, string> = {
  0: "bg-muted/40",
  1: "bg-primary/15",
  2: "bg-primary/35",
  3: "bg-primary/60",
  4: "bg-primary/90",
};

type GenreSegment = { label: string; pct: number; className: string };

const GENRE_SEGMENTS: readonly GenreSegment[] = [
  { label: "Hip-Hop", pct: 34, className: "bg-primary" },
  { label: "Pop", pct: 22, className: "bg-primary/70" },
  { label: "Rock", pct: 16, className: "bg-primary/50" },
  { label: "Electronic", pct: 12, className: "bg-primary/35" },
  { label: "R&B", pct: 9, className: "bg-primary/22" },
  { label: "Other", pct: 7, className: "bg-muted" },
];

function CatalogRow({ entry, size = "md" }: { entry: CatalogEntry; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-1.5">
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded-md text-xs font-medium",
          getRankClassName(entry.rank),
        )}
      >
        {entry.rank}
      </span>
      <CatalogImage image={entry.image} alt={entry.name} size={size} className="rounded-sm" />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-xs font-medium text-foreground">{entry.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{entry.subtitle}</p>
      </div>
      <FormattedMetric value={entry.metric} unit="min" size="sm" />
    </div>
  );
}

function FeatureVisual({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-h-40 flex-col justify-center overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  visual,
  className,
}: {
  icon: typeof RankingIcon;
  title: string;
  description: string;
  visual: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn("flex flex-col gap-4 rounded-xl border border-border bg-card p-4", className)}
    >
      {visual}
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Icon icon={icon} className="size-3.5 text-primary" />
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}

function RankedCatalogVisual() {
  return (
    <FeatureVisual className="justify-start p-2.5">
      <div className="mb-2 flex items-center gap-1">
        {CATALOG_TABS.map((tab, index) => (
          <span
            key={tab}
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-medium",
              index === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground",
            )}
          >
            {tab}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">by minutes</span>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {TOP_TRACKS.map((entry) => (
          <CatalogRow key={entry.name} entry={entry} />
        ))}
      </div>
    </FeatureVisual>
  );
}

function TrendsVisual() {
  return (
    <FeatureVisual className="h-full">
      <div className="flex items-center justify-between px-2.5 py-2">
        <span className="text-[10px] text-muted-foreground">Minutes / year</span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          +44% vs 2019
        </span>
      </div>
      <div className="size-full">
        <AreaChart data={TREND_DATA} xDataKey="name" className="aspect-auto! h-full">
          <Area dataKey="value" fill="var(--chart-3)" fillPattern="dots" />
          <Grid />
        </AreaChart>
      </div>
    </FeatureVisual>
  );
}

function HeatmapVisual() {
  return (
    <FeatureVisual className="p-3">
      <div className="flex gap-1.5">
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            {HEATMAP_ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-12 gap-1">
                {row.tiers.map((tier, dayIndex) => (
                  <span
                    key={dayIndex}
                    className={cn("aspect-square rounded-xs", HEATMAP_TIER_CLASS[tier])}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-12 gap-1">
            {HEATMAP_DAYS.map((day, index) => (
              <span key={index} className="text-center text-[8px] text-muted-foreground">
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
    </FeatureVisual>
  );
}

function GenresVisual() {
  return (
    <FeatureVisual className="gap-3 p-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {GENRE_SEGMENTS.map((segment) => (
          <div
            key={segment.label}
            className={segment.className}
            style={{ width: `${segment.pct}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {GENRE_SEGMENTS.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span className={cn("size-2 shrink-0 rounded-[3px]", segment.className)} />
            <span className="flex-1 truncate text-[10px] text-muted-foreground">
              {segment.label}
            </span>
            <span className="text-[10px] font-medium text-foreground tabular-nums">
              {segment.pct}%
            </span>
          </div>
        ))}
      </div>
    </FeatureVisual>
  );
}

function FilterVisual() {
  return (
    <FeatureVisual className="justify-start gap-2.5 p-2.5">
      <div className="flex items-center gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-card px-1.5 py-1">
          <CatalogImage
            image={ARTIST_IMAGE}
            alt="Playboi Carti"
            size="sm"
            className="size-4 rounded-full"
          />
          <span className="truncate text-[10px] font-medium text-foreground">Playboi Carti</span>
          <Icon icon={ArrowDown01Icon} className="size-3 shrink-0 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-1.5 py-1">
          <Icon icon={Calendar03Icon} className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-[10px] font-medium text-foreground">2019 – 2024</span>
        </div>
        <div className="ml-auto flex overflow-hidden rounded-md border border-border">
          <span className="grid size-6 place-items-center bg-primary text-primary-foreground">
            <Icon icon={LayoutTable01Icon} className="size-3" />
          </span>
          <span className="grid size-6 place-items-center border-l border-border text-muted-foreground">
            <Icon icon={GridIcon} className="size-3" />
          </span>
        </div>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {FILTERED_TRACKS.map((entry) => (
          <CatalogRow key={entry.name} entry={entry} size="sm" />
        ))}
      </div>
    </FeatureVisual>
  );
}

export function LandingFeatures() {
  return (
    <section className="w-full py-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Explore every angle of your listening
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            From ranked catalogs to peak-hour heatmaps, Harmony turns years of streams into dense,
            interactive analytics.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={RankingIcon}
            title="Ranked catalogs"
            description="Your most-played tracks, artists, and albums, ranked by minutes with covers and rank badges."
            visual={<RankedCatalogVisual />}
            className="sm:col-span-2"
          />
          <FeatureCard
            icon={ChartLineData01Icon}
            title="Trends over time"
            description="Watch your listening rise and fall across months and years with interactive activity charts."
            visual={<TrendsVisual />}
          />
          <FeatureCard
            icon={Time04Icon}
            title="Peak-hour heatmap"
            description="See exactly when you listen, by hour and weekday, in a calendar-style intensity grid."
            visual={<HeatmapVisual />}
          />
          <FeatureCard
            icon={Album02Icon}
            title="Genre breakdown"
            description="Understand the shape of your taste with a genre split drawn from every stream."
            visual={<GenresVisual />}
          />
          <FeatureCard
            icon={FilterIcon}
            title="Filter by artist & date"
            description="Focus any view on one artist or date range and every chart and ranking updates instantly."
            visual={<FilterVisual />}
          />
        </div>
      </div>
    </section>
  );
}
