import { queryOptions } from "@tanstack/react-query";

import type { Scope } from "@/shared/scope";

import { firstsFn } from "@/data/milestones/firsts";
import { nextMilestonesFn } from "@/data/milestones/next-milestones";
import { sessionsFn } from "@/data/milestones/sessions";
import { streakFn } from "@/data/milestones/streak";
import { summaryFn } from "@/data/milestones/summary";
import { timelineFn } from "@/data/milestones/timeline";

export const milestoneQueries = {
  summary: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["milestones", "summary", filter],
        queryFn: () => summaryFn(filter),
      }),
  },
  nextMilestones: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["milestones", "next", filter],
        queryFn: () => nextMilestonesFn(filter),
      }),
  },
  streak: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["milestones", "streak", filter],
        queryFn: () => streakFn(filter),
      }),
  },
  sessions: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["milestones", "sessions", filter],
        queryFn: () => sessionsFn(filter),
      }),
  },
  timeline: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["milestones", "timeline", filter],
        queryFn: () => timelineFn(filter),
      }),
  },
  firsts: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["milestones", "firsts", filter],
        queryFn: () => firstsFn(filter),
      }),
  },
};
