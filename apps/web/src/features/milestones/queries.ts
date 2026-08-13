import { queryOptions } from "@tanstack/react-query";

import type { Filter } from "@/lib/filter";

import { firstsFn } from "./queries/firsts";
import { nextMilestonesFn } from "./queries/next-milestones";
import { sessionsFn } from "./queries/sessions";
import { streakFn } from "./queries/streak";
import { summaryFn } from "./queries/summary";
import { timelineFn } from "./queries/timeline";

export const milestonesQueries = {
  summary: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["milestones", "summary", filter],
        queryFn: () => summaryFn(filter),
      }),
  },
  nextMilestones: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["milestones", "next", filter],
        queryFn: () => nextMilestonesFn(filter),
      }),
  },
  streak: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["milestones", "streak", filter],
        queryFn: () => streakFn(filter),
      }),
  },
  sessions: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["milestones", "sessions", filter],
        queryFn: () => sessionsFn(filter),
      }),
  },
  timeline: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["milestones", "timeline", filter],
        queryFn: () => timelineFn(filter),
      }),
  },
  firsts: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["milestones", "firsts", filter],
        queryFn: () => firstsFn(filter),
      }),
  },
};
