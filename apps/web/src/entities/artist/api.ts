import { queryOptions } from "@tanstack/react-query";

import type { Scope } from "@/shared/scope";

import { artistKpisFn, artistMonthlyFn, getArtistFn } from "@/data/artists/profile";
import { searchArtistsFn } from "@/data/artists/search";
import { rankFn } from "@/data/rank";
import { toSqlDate } from "@/data/sql/date-range";

type ArtistRange = { artistId: number; from: Date; to: Date };

const rangeKey = ({ artistId, from, to }: ArtistRange) => ({
  artistId,
  from: toSqlDate(from),
  to: toSqlDate(to),
});

export const artistQueries = {
  top: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["artists", "top", filter],
        queryFn: () => rankFn({ by: "artist", scope: filter }),
      }),
  },
  get: {
    queryOptions: (artistId: number) =>
      queryOptions({
        queryKey: ["artists", "get", artistId],
        queryFn: () => getArtistFn(artistId),
      }),
  },
  kpis: {
    queryOptions: (args: ArtistRange) =>
      queryOptions({
        queryKey: ["artists", "kpis", rangeKey(args)],
        queryFn: () => artistKpisFn(args),
      }),
  },
  monthly: {
    queryOptions: (args: ArtistRange) =>
      queryOptions({
        queryKey: ["artists", "monthly", rangeKey(args)],
        queryFn: () => artistMonthlyFn(args),
      }),
  },
  tracks: {
    queryOptions: (scope: Scope) =>
      queryOptions({
        queryKey: ["artists", "tracks", scope],
        queryFn: () => rankFn({ by: "track", scope, limit: 10 }),
      }),
  },
  albums: {
    queryOptions: (scope: Scope) =>
      queryOptions({
        queryKey: ["artists", "albums", scope],
        queryFn: () => rankFn({ by: "album", scope, limit: 10 }),
      }),
  },
  search: {
    queryOptions: ({ query, from, to }: { query?: string; from: Date; to: Date }) =>
      queryOptions({
        queryKey: ["artists", "search", { query, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => searchArtistsFn({ query, from, to }),
      }),
  },
};
