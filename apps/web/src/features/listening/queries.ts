import { queryOptions } from "@tanstack/react-query";

import { activeDaysFn } from "./queries/active-days";
import { daysOfWeekFn } from "./queries/days-of-week";
import { listeningStyleFn } from "./queries/listening-style";
import { listeningTimeFn } from "./queries/listening-time";
import { monthlyActivityFn } from "./queries/monthly-activity";
import { peakHoursFn } from "./queries/peak-hours";
import { platformsFn } from "./queries/platforms";
import { totalStreamsFn } from "./queries/total-streams";
import { trackEngagementFn } from "./queries/track-engagement";
import { uniqueTracksFn } from "./queries/unique-tracks";
import { whenYouListenFn } from "./queries/when-you-listen";

export const listeningQueries = {
  listeningTime: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "listening-time"],
        queryFn: () => listeningTimeFn(),
      }),
  },
  totalStreams: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "total-streams"],
        queryFn: () => totalStreamsFn(),
      }),
  },
  activeDays: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "active-days"],
        queryFn: () => activeDaysFn(),
      }),
  },
  uniqueTracks: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "unique-tracks"],
        queryFn: () => uniqueTracksFn(),
      }),
  },
  monthlyActivity: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["listening", "monthly-activity"],
        queryFn: () => monthlyActivityFn(),
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
};
