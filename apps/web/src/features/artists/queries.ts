import { queryOptions } from "@tanstack/react-query";

import { Filter } from "@/lib/filter";

import { searchArtistsFn } from "./queries/search";
import { topArtistsFn } from "./queries/top";

export const artistsQueries = {
  top: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["artists", "top", filter],
        queryFn: () => topArtistsFn(filter),
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
