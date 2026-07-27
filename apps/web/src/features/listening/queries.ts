import { queryOptions } from "@tanstack/react-query";

import { Filter } from "@/lib/filter";

import { activeDaysFn } from "./queries/active-days";
import { daysOfWeekFn } from "./queries/days-of-week";
import { genresFn } from "./queries/genres";
import { listeningStyleFn } from "./queries/listening-style";
import { listeningTimeFn } from "./queries/listening-time";
import { monthlyActivityFn } from "./queries/monthly-activity";
import { peakHoursFn } from "./queries/peak-hours";
import { platformsFn } from "./queries/platforms";
import { releaseYearFn } from "./queries/release-year";
import { totalStreamsFn } from "./queries/total-streams";
import { trackEngagementFn } from "./queries/track-engagement";
import { uniqueTracksFn } from "./queries/unique-tracks";
import { whenYouListenFn } from "./queries/when-you-listen";

export const listeningQueries = {
  listeningTime: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["listening", "listening-time", filter],
        queryFn: () => listeningTimeFn(filter),
      }),
  },
  totalStreams: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["listening", "total-streams", filter],
        queryFn: () => totalStreamsFn(filter),
      }),
  },
  activeDays: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["listening", "active-days", filter],
        queryFn: () => activeDaysFn(filter),
      }),
  },
  uniqueTracks: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["listening", "unique-tracks", filter],
        queryFn: () => uniqueTracksFn(filter),
      }),
  },
  monthlyActivity: {
    queryOptions: (filter: Filter) =>
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
