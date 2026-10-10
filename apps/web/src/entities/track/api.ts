import { queryOptions } from "@tanstack/react-query";

import type { Scope } from "@/shared/scope";

import { rankFn } from "@/data/rank";
import { toSqlDate } from "@/data/sql/date-range";
import { trackBehavioralFn } from "@/data/tracks/behavioral";
import { trackDevicesFn } from "@/data/tracks/devices";
import { getTrackFn } from "@/data/tracks/get";
import { trackHistoryFn } from "@/data/tracks/history";
import { trackListeningFn } from "@/data/tracks/listening";
import { trackOverviewFn } from "@/data/tracks/overview";
import { trackTrendsFn } from "@/data/tracks/trends";
import { trackVsAverageFn } from "@/data/tracks/vs-average";

type TrackRangeArgs = { trackId: number; from: Date; to: Date };

export const trackQueries = {
  top: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["tracks", "top", filter],
        queryFn: () => rankFn({ by: "track", scope: filter }),
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
