import type { ReactNode } from "react";

import { Bar, BarChart, ChartTooltip, Grid, XAxis } from "@harmony/charts/v2";
import { Alert02Icon, Cancel01Icon, Icon, Loading03Icon, Tick02Icon } from "@harmony/icons";
import { Badge } from "@harmony/ui/components/badge";
import { cn } from "@harmony/ui/lib/utils";

import { CatalogImage } from "@/components/catalog/catalog-image";
import { FormattedMetric } from "@/components/format/formatted-metric";
import { Icons } from "@/components/icons";

import { getRankClassName } from "../catalog/catalog-table";

const SPOTIFY_PRIVACY_URL = "https://www.spotify.com/account/privacy/";

const ARCHIVE_FILES = [
  { name: "Streaming_History_Audio_2019-2021_0.json", size: "2.8 MB" },
  { name: "Streaming_History_Audio_2021-2023_0.json", size: "4.1 MB" },
  { name: "Streaming_History_Audio_2023-2024_0.json", size: "3.6 MB" },
  { name: "Streaming_History_Audio_2024_0.json", size: "1.9 MB" },
] as const;

type PipelineStageStatus = "done" | "running" | "pending";

type PipelineOutput =
  | { kind: "files"; count: number }
  | { kind: "pair"; ok: number; bad: number }
  | { kind: "resolve"; resolved: number; missed: number; errors: number }
  | { kind: "progress"; current: number; total: number };

type PipelineStage = {
  label: string;
  status: PipelineStageStatus;
  output?: PipelineOutput;
};

const PIPELINE_STAGES: readonly PipelineStage[] = [
  {
    label: "Extract archive",
    status: "done",
    output: { kind: "files", count: ARCHIVE_FILES.length },
  },
  {
    label: "Parse interactions",
    status: "done",
    output: { kind: "pair", ok: 48213, bad: 12 },
  },
  {
    label: "Normalize interactions",
    status: "done",
    output: { kind: "pair", ok: 47891, bad: 318 },
  },
  {
    label: "Resolve tracks",
    status: "done",
    output: { kind: "resolve", resolved: 4812, missed: 86, errors: 3 },
  },
  {
    label: "Enrich tracks",
    status: "running",
    output: { kind: "progress", current: 1842, total: 2104 },
  },
  { label: "Enrich albums", status: "pending" },
  { label: "Save interactions", status: "pending" },
];

const INSIGHT_TRACK = {
  name: "FE!N",
  artists: "Travis Scott, Playboi Carti",
  image:
    "https://cdn-images.dzcdn.net/images/cover/6c91e64b7157f1332a4f6b0de9e4c714/56x56-000000-80-0-0.jpg",
} as const;

const OVERVIEW_STATS: ReadonlyArray<{ label: string; value: number; unit?: string }> = [
  { label: "Total streams", value: 1190 },
  { label: "Time listened", value: 2538, unit: "min" },
  { label: "Avg completion", value: 87, unit: "%" },
  { label: "Skip rate", value: 9, unit: "%" },
];

const LISTENING_DATA = [
  { name: "Jan 2026", value: 42 },
  { name: "Feb 2026", value: 118 },
  { name: "Mar 2026", value: 7 },
  { name: "Apr 2026", value: 53 },
  { name: "May 2026", value: 96 },
  { name: "Jun 2026", value: 12 },
  { name: "Jul 2026", value: 64 },
  { name: "Aug 2026", value: 80 },
  { name: "Sep 2026", value: 9 },
  { name: "Oct 2026", value: 70 },
  { name: "Nov 2026", value: 35 },
  { name: "Dec 2026", value: 111 },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-normal text-muted-foreground">{children}</p>;
}

function ShowcaseCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex min-h-0 flex-col gap-3 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </article>
  );
}

function PackageCard() {
  return (
    <ShowcaseCard title="Your package" className="h-full gap-2.5">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>How to get it</SectionLabel>
          <Badge variant="secondary">Up to 30 days</Badge>
        </div>
        <ol className="overflow-hidden rounded-lg border border-border">
          <li className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-medium text-primary">
              1
            </span>
            <a
              href={SPOTIFY_PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
            >
              Spotify Privacy settings
            </a>
          </li>
          <li className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-medium text-primary">
              2
            </span>
            <p className="truncate text-xs text-foreground">
              Request <span className="font-medium">Extended</span> streaming history
            </p>
          </li>
          <li className="flex items-center gap-2 px-2.5 py-1.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-medium text-primary">
              3
            </span>
            <p className="truncate text-xs text-foreground">Download ZIP from email</p>
          </li>
        </ol>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2">
        <Icons.spotify className="size-3 shrink-0" />
        <p className="truncate text-xs font-medium text-foreground">my_spotify_data.zip</p>
        <p className="ml-auto font-mono text-xs text-muted-foreground">12.4 MB</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Files</SectionLabel>
          <span className="text-[10px] text-muted-foreground">2019-2024</span>
        </div>
        <ul className="overflow-hidden rounded-lg border border-border">
          {ARCHIVE_FILES.map((file, index) => (
            <li
              key={file.name}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1",
                index < ARCHIVE_FILES.length - 1 && "border-b border-border",
              )}
            >
              <span className="flex size-3.5 shrink-0 items-center justify-center rounded-lg border border-primary bg-primary text-primary-foreground">
                <Icon icon={Tick02Icon} className="size-2.5" strokeWidth={2} />
              </span>
              <p className="min-w-0 flex-1 truncate text-xs text-foreground">{file.name}</p>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {file.size}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ShowcaseCard>
  );
}

function PipelineStageIcon({ status }: { status: PipelineStageStatus }) {
  if (status === "pending") {
    return (
      <span className="grid size-3.5 shrink-0 place-items-center">
        <span className="size-1.5 rounded-full bg-muted-foreground/35" />
      </span>
    );
  }

  if (status === "running") {
    return <Icon icon={Loading03Icon} className="size-3.5 shrink-0 animate-spin" />;
  }

  return <Icon icon={Tick02Icon} className="size-3.5 shrink-0 text-primary" strokeWidth={2} />;
}

function PipelineStageOutput({ output }: { output: PipelineOutput }) {
  switch (output.kind) {
    case "files":
      return (
        <span className="text-[10px] text-muted-foreground">
          {output.count.toLocaleString()} files
        </span>
      );
    case "pair":
      return (
        <span className="flex items-center gap-1.5 text-[10px]">
          <span className="flex items-center gap-0.5 text-primary">
            <Icon icon={Tick02Icon} className="size-2.5" />
            {output.ok.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5 text-destructive">
            <Icon icon={Cancel01Icon} className="size-2.5" />
            {output.bad.toLocaleString()}
          </span>
        </span>
      );
    case "resolve":
      return (
        <span className="flex items-center gap-1.5 text-[10px]">
          <span className="flex items-center gap-0.5 text-primary">
            <Icon icon={Tick02Icon} className="size-2.5" />
            {output.resolved.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5 text-yellow-600">
            <Icon icon={Alert02Icon} className="size-2.5" />
            {output.missed.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5 text-destructive">
            <Icon icon={Cancel01Icon} className="size-2.5" />
            {output.errors.toLocaleString()}
          </span>
        </span>
      );
    case "progress":
      return (
        <span className="text-[10px] font-medium">
          {output.current.toLocaleString()} / {output.total.toLocaleString()}
        </span>
      );
  }
}

function PipelineCard() {
  return (
    <ShowcaseCard title="Processing" className="h-full">
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="flex flex-col px-2.5 py-2">
            <span className="text-[10px] font-medium text-muted-foreground">Files</span>
            <span className="text-xs font-medium text-foreground">{ARCHIVE_FILES.length} JSON</span>
          </div>
          <div className="flex flex-col px-2.5 py-2">
            <span className="text-[10px] font-medium text-muted-foreground">Time</span>
            <span className="text-xs font-medium text-foreground">1m 48s</span>
          </div>
          <div className="flex flex-col px-2.5 py-2">
            <span className="text-[10px] font-medium text-muted-foreground">Status</span>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              In progress
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Pipeline</SectionLabel>
        <ul className="overflow-hidden rounded-lg border border-border">
          {PIPELINE_STAGES.map((stage, index) => (
            <li
              key={stage.label}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5",
                index < PIPELINE_STAGES.length - 1 && "border-b border-border",
                stage.status === "done" && "bg-muted/10",
                stage.status === "running" && "bg-muted/30",
                stage.status === "pending" && "opacity-50",
              )}
            >
              <PipelineStageIcon status={stage.status} />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-xs",
                  stage.status === "running" ? "font-medium text-foreground" : "text-foreground",
                  stage.status === "pending" && "text-muted-foreground",
                )}
              >
                {stage.label}
              </span>
              {stage.output ? <PipelineStageOutput output={stage.output} /> : null}
            </li>
          ))}
        </ul>
      </div>
    </ShowcaseCard>
  );
}

function InsightCard() {
  return (
    <ShowcaseCard title="Your Insight" className="h-full">
      <div className="flex items-center gap-3">
        <CatalogImage image={INSIGHT_TRACK.image} alt={INSIGHT_TRACK.name} size="lg" blur />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{INSIGHT_TRACK.name}</p>
          <p className="truncate text-xs text-muted-foreground">{INSIGHT_TRACK.artists}</p>
        </div>
        <span
          className={cn(
            "ml-auto inline-flex h-5 min-w-6 items-center justify-center rounded-md text-xs font-medium",
            getRankClassName(3),
          )}
        >
          #3
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* <SectionLabel>Overview</SectionLabel> */}
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card *:border-border [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(odd)]:border-r">
          {OVERVIEW_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col px-2.5 py-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">{stat.label}</span>
              <FormattedMetric size="md" value={stat.value} unit={stat.unit} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Listening</SectionLabel>
        <div className="rounded-lg border border-border bg-card px-2.5 pt-1.5 pb-1">
          <BarChart className="aspect-7/2" data={LISTENING_DATA} xDataKey="name">
            <Bar dataKey="value" fill="var(--chart-2)" />
            <Grid />
            <XAxis gap={2} />
            <ChartTooltip suffix="min" />
          </BarChart>
        </div>
      </div>

      {/* <div className="mt-auto grid grid-cols-2 gap-1.5">
        <Button size="sm" className="w-full">
          Open dashboard
        </Button>
        <Button size="sm" variant="outline" className="w-full">
          Try the demo
        </Button>
      </div> */}
    </ShowcaseCard>
  );
}

export function LandingHowItWorks() {
  return (
    <section className="w-full py-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-0">
        <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-1">
          <h2 className="text-2xl font-bold tracking-tight">How we reads your history</h2>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            From your Spotify package to ranked tracks and artists, your history becomes a dense
            analytics dashboard.
          </p>
        </div>

        <div className="group/cards relative mx-auto grid w-full max-w-5xl place-items-center overflow-visible py-8">
          {/* Left — back layer (green in schema), tucked under right at the bottom cross */}
          <div
            className={cn(
              "col-start-1 row-start-1 h-full w-[min(100%,20.5rem)]",
              "origin-bottom transition-[translate,rotate,scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              "z-0 -translate-x-[28%] translate-y-5 scale-[0.97] -rotate-10",
              "group-hover/cards:-translate-x-[calc(100%+0.75rem)] group-hover/cards:translate-y-0 group-hover/cards:scale-100 group-hover/cards:rotate-0",
              "group-focus-within/cards:-translate-x-[calc(100%+0.75rem)] group-focus-within/cards:translate-y-0 group-focus-within/cards:scale-100 group-focus-within/cards:rotate-0",
            )}
          >
            <PackageCard />
          </div>

          {/* Right — middle layer (blue in schema), overlaps left at the bottom */}
          <div
            className={cn(
              "col-start-1 row-start-1 h-full w-[min(100%,20.5rem)]",
              "origin-bottom transition-[translate,rotate,scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              "z-5 translate-x-[24%] translate-y-3 scale-[0.97] rotate-7",
              "group-hover/cards:z-0 group-hover/cards:translate-x-[calc(100%+0.75rem)] group-hover/cards:translate-y-0 group-hover/cards:scale-100 group-hover/cards:rotate-0",
              "group-focus-within/cards:z-0 group-focus-within/cards:translate-x-[calc(100%+0.75rem)] group-focus-within/cards:translate-y-0 group-focus-within/cards:scale-100 group-focus-within/cards:rotate-0",
            )}
          >
            <InsightCard />
          </div>

          {/* Center — front layer (red in schema) */}
          <div
            className={cn(
              "col-start-1 row-start-1 h-full w-[min(100%,20.5rem)]",
              "z-10 origin-bottom transition-[translate,rotate,scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            )}
          >
            <PipelineCard />
          </div>
        </div>
      </div>
    </section>
  );
}
