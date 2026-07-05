import { queryOptions } from "@tanstack/react-query";

import { toSqlDate } from "@/lib/sql/date-range";

import { searchArtistsFn } from "./queries/search";
import { topArtistsFn } from "./queries/top";

export const artistsQueries = {
  top: {
    queryOptions: ({ size = 50, from, to }: { size?: number; from: Date; to: Date }) =>
      queryOptions({
        queryKey: ["artists", "top", { size, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => topArtistsFn({ size, from, to }),
      }),
  },
  search: {
    queryOptions: ({ query }: { query?: string }) =>
      queryOptions({
        queryKey: ["artists", "search", { query }],
        queryFn: () => searchArtistsFn({ query }),
      }),
  },
};
