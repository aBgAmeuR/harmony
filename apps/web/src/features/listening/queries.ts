import { queryOptions } from "@tanstack/react-query";

import { toSqlDate } from "@/lib/sql/date-range";

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

type ListeningFilterArgs = { artistId?: number; from: Date; to: Date };

function listeningFilterKey({ artistId, from, to }: ListeningFilterArgs) {
  return { artistId, from: toSqlDate(from), to: toSqlDate(to) };
}

export const listeningQueries = {
  listeningTime: {
    queryOptions: (args: ListeningFilterArgs) =>
      queryOptions({
        queryKey: ["listening", "listening-time", listeningFilterKey(args)],
        queryFn: () => listeningTimeFn(args),
      }),
  },
  totalStreams: {
    queryOptions: (args: ListeningFilterArgs) =>
      queryOptions({
        queryKey: ["listening", "total-streams", listeningFilterKey(args)],
        queryFn: () => totalStreamsFn(args),
      }),
  },
  activeDays: {
    queryOptions: (args: ListeningFilterArgs) =>
      queryOptions({
        queryKey: ["listening", "active-days", listeningFilterKey(args)],
        queryFn: () => activeDaysFn(args),
      }),
  },
  uniqueTracks: {
    queryOptions: (args: ListeningFilterArgs) =>
      queryOptions({
        queryKey: ["listening", "unique-tracks", listeningFilterKey(args)],
        queryFn: () => uniqueTracksFn(args),
      }),
  },
  monthlyActivity: {
    queryOptions: (args: ListeningFilterArgs) =>
      queryOptions({
        queryKey: ["listening", "monthly-activity", listeningFilterKey(args)],
        queryFn: () => monthlyActivityFn(args),
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
