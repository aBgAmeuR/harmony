import type { Scope } from "@/shared/scope";

import { scopeFilter } from "@/data/filter";
import {
  firstsFn,
  marksFn,
  nextMilestonesFn,
  sessionStatsFn,
  summaryFn,
  type Mark,
} from "@/data/milestones";
import { streakFn } from "@/data/streak";
import { format } from "@/shared/lib/format";
import { query } from "@/shared/lib/query";

export type TimelineEvent = {
  id: string;
  date: string;
  label: string;
  entity: string;
  subtitle: string;
  image: string | null;
};

const LABELS: Record<Mark["kind"], (threshold: number) => string> = {
  hours: (n) => `${format.count(n)} hours listened`,
  streams: (n) => `${format.count(n)} streams reached`,
  artists: (n) => `${format.count(n)} unique artists`,
  tracks: (n) => `${format.count(n)} unique tracks`,
  first: () => "First listen",
};

const timelineFn = async (scope: Scope): Promise<TimelineEvent[]> =>
  (await marksFn(scopeFilter(scope))).map((mark) => ({
    id: `${mark.kind}-${mark.threshold}-${mark.date}`,
    date: mark.date,
    label: LABELS[mark.kind](mark.threshold),
    entity: mark.entity ?? "",
    subtitle: mark.subtitle ?? "",
    image: mark.image,
  }));

const scoped =
  <R>(fn: (filter: ReturnType<typeof scopeFilter>) => Promise<R>) =>
  (scope: Scope) =>
    fn(scopeFilter(scope));

export const milestoneQueries = {
  summary: query("milestones-summary", scoped(summaryFn)),
  next: query("milestones-next", scoped(nextMilestonesFn)),
  streak: query("milestones-streak", scoped(streakFn)),
  sessions: query("milestones-sessions", scoped(sessionStatsFn)),
  timeline: query("milestones-timeline", timelineFn),
  firsts: query("milestones-firsts", scoped(firstsFn)),
};
