import { queryOptions } from "@tanstack/react-query";

import { activeDaysFn } from "@/data/listening/active-days";
import { daysOfWeekFn } from "@/data/listening/days-of-week";
import { genresFn } from "@/data/listening/genres";
import { listeningStyleFn } from "@/data/listening/listening-style";
import { listeningTimeFn } from "@/data/listening/listening-time";
import { monthlyActivityFn } from "@/data/listening/monthly-activity";
import { peakHoursFn } from "@/data/listening/peak-hours";
import { platformsFn } from "@/data/listening/platforms";
import { releaseYearFn } from "@/data/listening/release-year";
import { totalStreamsFn } from "@/data/listening/total-streams";
import { trackEngagementFn } from "@/data/listening/track-engagement";
import { uniqueTracksFn } from "@/data/listening/unique-tracks";
import { whenYouListenFn } from "@/data/listening/when-you-listen";
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
  monthlyActivity: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["listening", "monthly-activity", filter],
        queryFn: () => monthlyActivityFn(filter),
      }),
  },
  daysOfWeek: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "days-of-week"],
        queryFn: () => daysOfWeekFn(),
      }),
  },
  peakHours: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "peak-hours"],
        queryFn: () => peakHoursFn(),
      }),
  },
  platforms: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "platforms"],
        queryFn: () => platformsFn(),
      }),
  },
  listeningStyle: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "listening-style"],
        queryFn: () => listeningStyleFn(),
      }),
  },
  trackEngagement: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "track-engagement"],
        queryFn: () => trackEngagementFn(),
      }),
  },
  whenYouListen: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "when-you-listen"],
        queryFn: () => whenYouListenFn(),
      }),
  },
  releaseYear: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "release-year"],
        queryFn: () => releaseYearFn(),
      }),
  },
  genres: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "genres"],
        queryFn: () => genresFn(),
      }),
  },
};
