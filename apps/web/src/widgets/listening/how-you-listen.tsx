import { Card } from "@harmony/ui/components/card";
import { cn } from "@harmony/ui/lib/utils";
import { useState } from "react";

import type { ListeningStyleMetric, PlatformPoint } from "@/data/listening/types";

import { format } from "@/utils/format";

export const percent = (value: number) => format.as(value, "percent");
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

// Share of the plays for one style metric, 0 when it is missing.
export const shareOf = (style: ListeningStyleMetric[], key: ListeningStyleMetric["key"]) =>
  style.find((metric) => metric.key === key)?.value ?? 0;

type OutcomeKey = "finished" | "partial" | "skipped";
type Outcome = { key: OutcomeKey; label: string; share: number };

// Paint of a waffle cell and of its legend swatch.
const OUTCOME_PAINT: Record<OutcomeKey, string> = {
  finished: "bg-chart-1",
  partial: "bg-chart-4",
  skipped: "border border-muted-foreground/40",
};

// Splits 100 cells between the shares, largest remainders first, so they add up to 100.
const toCells = (shares: number[]): number[] => {
  const exact = shares.map((share) => share * 100);
  const cells = exact.map(Math.floor);
  let left = 100 - sum(cells);
  const byRest = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  for (const { index } of byRest) {
    if (left <= 0) break;
    cells[index] = (cells[index] ?? 0) + 1;
    left -= 1;
  }
  return cells;
};

// A hundred plays as a 10 by 10 grid: finished, cut short, skipped. Hovering a legend line
// picks out its cells.
const PlaysWaffle = ({ outcomes }: { outcomes: Outcome[] }) => {
  const [hovered, setHovered] = useState<OutcomeKey | null>(null);
  const counts = sum(outcomes.map((o) => o.share)) > 0 ? toCells(outcomes.map((o) => o.share)) : [];
  const cells = outcomes.flatMap((outcome, i) =>
    Array.from({ length: counts[i] ?? 0 }, () => outcome.key),
  );

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <div
        role="img"
        aria-label={outcomes.map((o) => `${o.label} ${percent(o.share)}`).join(", ")}
        className="grid w-40 shrink-0 grid-cols-10 gap-[3px]"
      >
        {Array.from({ length: 100 }, (_, i) => {
          const key = cells[i];
          return (
            <span
              key={i}
              className={cn(
                "aspect-square rounded-[3px] transition-opacity",
                key ? OUTCOME_PAINT[key] : "bg-muted",
                hovered !== null && key !== hovered && "opacity-25",
              )}
            />
          );
        })}
      </div>
      <div className="flex flex-col gap-2 text-xs">
        <span className="text-muted-foreground">Every 100 plays</span>
        <dl className="flex flex-col gap-1.5">
          {outcomes.map((outcome) => (
            <div
              key={outcome.key}
              className="flex items-center gap-2"
              onMouseEnter={() => setHovered(outcome.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                aria-hidden
                className={cn("size-2.5 rounded-[3px]", OUTCOME_PAINT[outcome.key])}
              />
              <dt className="w-16 text-muted-foreground">{outcome.label}</dt>
              <dd className="ml-auto font-medium tabular-nums">{percent(outcome.share)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

const RING_RADIUS = 18;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

// A share as a small ring, filled clockwise from the top.
const Ring = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-center gap-3">
    <svg viewBox="0 0 44 44" aria-hidden className="size-11 shrink-0 -rotate-90">
      <circle
        cx="22"
        cy="22"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="4"
        className="stroke-muted"
      />
      {value > 0 ? (
        <circle
          cx="22"
          cy="22"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${RING_LENGTH * Math.min(value, 1)} ${RING_LENGTH}`}
          className="stroke-chart-1"
        />
      ) : null}
    </svg>
    <div className="flex flex-col">
      <span className="text-base font-semibold tabular-nums">{percent(value)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  </div>
);

// Devices shown apart; the others share one segment.
const MAX_DEVICES = 3;

// Paint of each device segment, the most used first.
const DEVICE_PAINT = [
  "bg-chart-1 text-background",
  "bg-accent text-foreground",
  "bg-secondary text-foreground",
  "bg-muted text-muted-foreground",
];

type Device = { label: string; share: number };

const toDevices = (platforms: PlatformPoint[]): Device[] => {
  const total = sum(platforms.map((platform) => platform.value));
  if (total === 0) return [];
  const rest = sum(platforms.slice(MAX_DEVICES).map((platform) => platform.value));
  return [
    ...platforms.slice(0, MAX_DEVICES),
    ...(rest > 0 ? [{ label: "Others", value: rest }] : []),
  ].map((device) => ({ label: device.label, share: device.value / total }));
};

// Plays by device as one split bar. The last segment reads from the right.
const DeviceBar = ({ devices }: { devices: Device[] }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs text-muted-foreground">Devices</span>
    <div className="flex h-8 gap-0.5">
      {devices.map((device, i) => (
        <div
          key={device.label}
          title={`${device.label} · ${percent(device.share)}`}
          className={cn(
            "flex min-w-1 items-center overflow-hidden rounded-sm px-2 text-xs font-medium first:rounded-l-md last:rounded-r-md",
            DEVICE_PAINT[i] ?? DEVICE_PAINT.at(-1),
            i > 0 && i === devices.length - 1 && "justify-end",
          )}
          style={{ flex: `${device.share} 1 0%` }}
        >
          <span className="truncate">{device.label}</span>
        </div>
      ))}
    </div>
    <div className="flex gap-0.5 text-[10px] text-muted-foreground tabular-nums">
      {devices.map((device, i) => (
        <span
          key={device.label}
          className={cn("min-w-1 truncate", i > 0 && i === devices.length - 1 && "text-right")}
          style={{ flex: `${device.share} 1 0%` }}
        >
          {percent(device.share)}
        </span>
      ))}
    </div>
  </div>
);

type ListeningSharesProps = {
  style: ListeningStyleMetric[];
  platforms: PlatformPoint[];
  className?: string;
};

// Shuffle and offline shares as rings, above the plays split by device.
export const ListeningShares = ({ style, platforms, className }: ListeningSharesProps) => (
  <div className={cn("flex flex-col justify-center gap-5", className)}>
    <div className="flex flex-wrap gap-x-10 gap-y-4">
      <Ring value={shareOf(style, "shuffle")} label="on shuffle" />
      <Ring value={shareOf(style, "offline")} label="offline" />
    </div>
    <DeviceBar devices={toDevices(platforms)} />
  </div>
);

type HowYouListenCardProps = {
  style: ListeningStyleMetric[];
  platforms: PlatformPoint[];
  className?: string;
};

// How plays run (finished, cut short, skipped, shuffled, offline) and on which devices.
export const HowYouListenCard = ({ style, platforms, className }: HowYouListenCardProps) => {
  const finished = shareOf(style, "finished");
  const skipped = shareOf(style, "skipped");
  // Neither skipped nor heard to the end.
  const partial = finished + skipped > 0 ? Math.max(0, 1 - finished - skipped) : 0;
  const outcomes: Outcome[] = [
    { key: "finished", label: "Finished", share: finished },
    { key: "partial", label: "Partial", share: partial },
    { key: "skipped", label: "Skipped", share: skipped },
  ];

  return (
    <Card
      size="xs"
      className={cn("grid gap-0 divide-y md:grid-cols-2 md:divide-x md:divide-y-0", className)}
    >
      <div className="flex items-center p-4">
        <PlaysWaffle outcomes={outcomes} />
      </div>
      <ListeningShares style={style} platforms={platforms} className="p-4" />
    </Card>
  );
};
