import type { NextMilestone } from "@/data/milestones";

import { format, toDate } from "@/shared/lib/format";

export const yearOf = (value: string): number => toDate(value).getFullYear();

export const sessionDurationParts = (
  minutes: number,
  unitStyle: "short" | "long" = "short",
): { value: number; unit: string } => {
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
};

export const formatBarCurrent = (bar: NextMilestone): string => {
  if (bar.id === "hours") {
    return bar.current.toLocaleString("en-US", { maximumFractionDigits: 1 });
  }
  return format.count(bar.current);
};

export const nextMilestoneCopy = (bar: NextMilestone): { remaining: string; target: string } => {
  switch (bar.id) {
    case "hours":
      return {
        remaining: `${bar.remaining.toLocaleString("en-US", { maximumFractionDigits: 1 })} h`,
        target: `${format.count(bar.target)} h`,
      };
    case "streams":
      return {
        remaining: `${format.count(bar.remaining)} streams`,
        target: `${format.count(bar.target)} streams`,
      };
    case "artists":
      return {
        remaining: `${format.count(bar.remaining)} artists`,
        target: `${format.count(bar.target)} unique`,
      };
    case "tracks":
      return {
        remaining: `${format.count(bar.remaining)} tracks`,
        target: `${format.count(bar.target)} unique tracks`,
      };
  }
};

export const heroHeadline = (days: number, streams: number): string => {
  const dayPart = days === 1 ? "1\u00a0listening day" : `${format.count(days)}\u00a0listening days`;
  const streamPart = streams === 1 ? "1\u00a0stream" : `${format.count(streams)}\u00a0streams`;
  return `${dayPart}, ${streamPart}.`;
};
