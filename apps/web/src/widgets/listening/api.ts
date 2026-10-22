import { queryOptions } from "@tanstack/react-query";

import type { OverTimeUnit } from "@/data/listening/types";

import { activeDaysFn } from "@/data/listening/active-days";
import { genresFn } from "@/data/listening/genres";
import { listeningStyleFn } from "@/data/listening/listening-style";
import { listeningTimeFn } from "@/data/listening/listening-time";
import { overTimeFn } from "@/data/listening/over-time";
import { platformsFn } from "@/data/listening/platforms";
import { releaseYearFn } from "@/data/listening/release-year";
import { rhythmFn } from "@/data/listening/rhythm";
import { totalStreamsFn } from "@/data/listening/total-streams";
import { trackEngagementFn } from "@/data/listening/track-engagement";
import { uniqueTracksFn } from "@/data/listening/unique-tracks";
import { Scope } from "@/shared/scope";

export const listeningQueries = {
  listeningTime: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "listening-time", filter],
        queryFn: () => listeningTimeFn(filter),
      }),
  },
  totalStreams: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "total-streams", filter],
        queryFn: () => totalStreamsFn(filter),
      }),
  },
  activeDays: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "active-days", filter],
        queryFn: () => activeDaysFn(filter),
      }),
  },
  uniqueTracks: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "unique-tracks", filter],
        queryFn: () => uniqueTracksFn(filter),
      }),
  },
  overTime: {
    queryOptions: (filter: Scope, unit: OverTimeUnit) =>
      queryOptions({
        queryKey: ["listening", "over-time", filter, unit],
        queryFn: () => overTimeFn({ ...filter, unit }),
      }),
  },
  rhythm: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "rhythm", filter],
        queryFn: () => rhythmFn(filter),
      }),
  },
  platforms: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "platforms", filter],
        queryFn: () => platformsFn(filter),
      }),
  },
  listeningStyle: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "listening-style", filter],
        queryFn: () => listeningStyleFn(filter),
      }),
  },
  trackEngagement: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "track-engagement", filter],
        queryFn: () => trackEngagementFn(filter),
      }),
  },
  releaseYear: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "release-year", filter],
        queryFn: () => releaseYearFn(filter),
      }),
  },
  genres: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "genres", filter],
        queryFn: () => genresFn(filter),
      }),
  },
};
