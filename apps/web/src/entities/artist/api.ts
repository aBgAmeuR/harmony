import { queryOptions } from "@tanstack/react-query";

import type { Scope } from "@/shared/scope";

import { searchArtistsFn } from "@/data/artists/search";
import { rankFn } from "@/data/rank";

export const artistQueries = {
  top: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["artists", "top", filter],
        queryFn: () => rankFn({ by: "artist", scope: filter }),
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
