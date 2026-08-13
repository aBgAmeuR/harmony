import type { NextMilestone } from "./types";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const longDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function parseMilestoneDate(value: string | Date): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (ymd) {
    const date = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMilestoneDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = parseMilestoneDate(value);
  if (!date) return "-";
  return dateFormat.format(date);
}

export function formatLongDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = parseMilestoneDate(value);
  if (!date) return "-";
  return longDateFormat.format(date);
}

export function yearOf(value: string): number | null {
  const date = parseMilestoneDate(value);
  return date ? date.getFullYear() : null;
}

export function sessionDurationParts(
  minutes: number,
  unitStyle: "short" | "long" = "short",
): { value: number; unit: string } {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return { value: 0, unit: unitStyle === "short" ? "min" : "minutes" };
  }
  if (minutes >= 60) {
    const hours = Math.round((minutes / 60) * 10) / 10;
    if (unitStyle === "short") return { value: hours, unit: "h" };
    return { value: hours, unit: hours === 1 ? "hour" : "hours" };
  }
  if (unitStyle === "short") return { value: minutes, unit: "min" };
  return { value: minutes, unit: minutes === 1 ? "minute" : "minutes" };
}

export function formatBarCurrent(bar: NextMilestone): string {
  if (bar.id === "hours") {
    return bar.current.toLocaleString("en-US", { maximumFractionDigits: 1 });
  }
  return formatCount(bar.current);
}

export function nextMilestoneCopy(bar: NextMilestone): { remaining: string; target: string } {
  switch (bar.id) {
    case "hours":
      return {
        remaining: `${bar.remaining.toLocaleString("en-US", { maximumFractionDigits: 1 })} h`,
        target: `${formatCount(bar.target)} h`,
      };
    case "streams":
      return {
        remaining: `${formatCount(bar.remaining)} streams`,
        target: `${formatCount(bar.target)} streams`,
      };
    case "artists":
      return {
        remaining: `${formatCount(bar.remaining)} artists`,
        target: `${formatCount(bar.target)} unique`,
      };
    case "tracks":
      return {
        remaining: `${formatCount(bar.remaining)} tracks`,
        target: `${formatCount(bar.target)} unique tracks`,
      };
  }
}

export function heroHeadline(days: number, streams: number): string {
  const dayPart = days === 1 ? "1\u00a0listening day" : `${formatCount(days)}\u00a0listening days`;
  const streamPart = streams === 1 ? "1\u00a0stream" : `${formatCount(streams)}\u00a0streams`;
  return `${dayPart}, ${streamPart}.`;
}
