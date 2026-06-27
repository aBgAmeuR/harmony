import { queryOptions } from "@tanstack/react-query";

import { activeDaysFn } from "./queries/active-days";
import { listeningTimeFn } from "./queries/listening-time";
import { totalStreamsFn } from "./queries/total-streams";
import { uniqueTracksFn } from "./queries/unique-tracks";

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
};
