import { queryOptions } from "@tanstack/react-query";

import type { Range } from "@/data/overview/range";

import { behaviorFn } from "@/data/overview/behavior";
import { habitsFn } from "@/data/overview/habits";
import { highlightsFn } from "@/data/overview/highlights";
import { overviewFn } from "@/data/overview/kpis";
import { rankFn } from "@/data/rank";
import { toSqlDate } from "@/data/sql/date-range";

const TOP = 5;

const key = ({ from, to }: Range) => ({ from: toSqlDate(from), to: toSqlDate(to) });

export const overviewQueries = {
  kpis: {
    queryOptions: (range: Range, full: Range = range) =>
      queryOptions({
        queryKey: ["overview", "kpis", key(range), key(full)],
        queryFn: () => overviewFn(range, full),
      }),
  },
  topArtists: {
    queryOptions: (range: Range) =>
      queryOptions({
        queryKey: ["overview", "top-artists", key(range)],
        queryFn: () => rankFn({ by: "artist", scope: range, limit: TOP }),
      }),
  },
  topAlbums: {
    queryOptions: (range: Range) =>
      queryOptions({
        queryKey: ["overview", "top-albums", key(range)],
        queryFn: () => rankFn({ by: "album", scope: range, limit: TOP }),
      }),
  },
  topTracks: {
    queryOptions: (range: Range) =>
      queryOptions({
        queryKey: ["overview", "top-tracks", key(range)],
        queryFn: () => rankFn({ by: "track", scope: range, limit: TOP }),
      }),
  },
  habits: {
    queryOptions: (range: Range) =>
      queryOptions({
        queryKey: ["overview", "habits", key(range)],
        queryFn: () => habitsFn(range),
      }),
  },
  behavior: {
    queryOptions: (range: Range) =>
      queryOptions({
        queryKey: ["overview", "behavior", key(range)],
        queryFn: () => behaviorFn(range),
      }),
  },
  highlights: {
    queryOptions: (range: Range) =>
      queryOptions({
        queryKey: ["overview", "highlights", key(range)],
        queryFn: () => highlightsFn(range),
      }),
  },
};
