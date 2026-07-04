import { queryOptions } from "@tanstack/react-query";

import { searchArtistsFn } from "./queries/search";
import { topArtistsFn } from "./queries/top";

export const artistsQueries = {
  top: {
    queryOptions: ({ size = 50 }: { size?: number }) =>
      queryOptions({
        queryKey: ["artists", "top", { size }],
        queryFn: () => topArtistsFn({ size }),
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
