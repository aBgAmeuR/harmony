import { queryOptions } from "@tanstack/react-query";

import type { Range, Unit } from "@/data/overview/range";

import { highlightsFn } from "@/data/overview/highlights";
import { overviewFn } from "@/data/overview/kpis";
import { rankFn } from "@/data/rank";
import { toSqlDate } from "@/data/sql/date-range";

const TOP = 5;

const key = ({ from, to }: Range) => ({ from: toSqlDate(from), to: toSqlDate(to) });

export const overviewQueries = {
  kpis: {
    queryOptions: (range: Range, full: Range = range, unit?: Unit) =>
      queryOptions({
        queryKey: ["overview", "kpis", key(range), key(full), unit ?? "auto"],
        queryFn: () => overviewFn(range, full, unit),
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
  highlights: {
    queryOptions: (range: Range) =>
      queryOptions({
        queryKey: ["overview", "highlights", key(range)],
        queryFn: () => highlightsFn(range),
      }),
  },
};
