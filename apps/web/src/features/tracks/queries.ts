import { queryOptions } from "@tanstack/react-query";

import { Filter } from "@/lib/filter";
import { toSqlDate } from "@/lib/sql/date-range";

import { trackBehavioralFn } from "./queries/behavioral";
import { trackDevicesFn } from "./queries/devices";
import { getTrackFn } from "./queries/get";
import { trackHistoryFn } from "./queries/history";
import { trackListeningFn } from "./queries/listening";
import { trackOverviewFn } from "./queries/overview";
import { topTracksFn } from "./queries/top";
import { trackTrendsFn } from "./queries/trends";
import { trackVsAverageFn } from "./queries/vs-average";

type TrackRangeArgs = { trackId: number; from: Date; to: Date };

export const tracksQueries = {
  top: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["tracks", "top", filter],
        queryFn: () => topTracksFn(filter),
      }),
  },
  trends: {
    queryOptions: ({ trackIds, from, to }: { trackIds: number[]; from: Date; to: Date }) =>
      queryOptions({
        queryKey: ["tracks", "trends", { trackIds, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackTrendsFn({ trackIds, from, to }),
        enabled: trackIds.length > 0,
      }),
  },
  get: {
    queryOptions: (trackId: number | null) =>
      queryOptions({
        queryKey: ["tracks", "get", trackId],
        queryFn: () => (trackId ? getTrackFn(trackId) : null),
        enabled: trackId !== null,
      }),
  },
  overview: {
    queryOptions: ({ trackId, from, to }: TrackRangeArgs) =>
      queryOptions({
        queryKey: ["tracks", "overview", { trackId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackOverviewFn({ trackId, from, to }),
      }),
  },
  history: {
    queryOptions: ({ trackId, from, to }: TrackRangeArgs) =>
      queryOptions({
        queryKey: ["tracks", "history", { trackId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackHistoryFn({ trackId, from, to }),
      }),
  },
  listening: {
    queryOptions: ({ trackId, from, to }: TrackRangeArgs) =>
      queryOptions({
        queryKey: ["tracks", "listening", { trackId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackListeningFn({ trackId, from, to }),
      }),
  },
  behavioral: {
    queryOptions: ({ trackId, from, to }: TrackRangeArgs) =>
      queryOptions({
        queryKey: ["tracks", "behavioral", { trackId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackBehavioralFn({ trackId, from, to }),
      }),
  },
  vsAverage: {
    queryOptions: ({ trackId, from, to }: TrackRangeArgs) =>
      queryOptions({
        queryKey: ["tracks", "vs-average", { trackId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackVsAverageFn({ trackId, from, to }),
      }),
  },
  devices: {
    queryOptions: ({ trackId, from, to }: TrackRangeArgs) =>
      queryOptions({
        queryKey: ["tracks", "devices", { trackId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackDevicesFn({ trackId, from, to }),
      }),
  },
};
