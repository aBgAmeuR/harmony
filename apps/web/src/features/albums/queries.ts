import { queryOptions } from "@tanstack/react-query";

import { Filter } from "@/lib/filter";

import { topAlbumsFn } from "./queries/top";

export const albumsQueries = {
  top: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["albums", "top", filter],
        queryFn: () => topAlbumsFn(filter),
      }),
  },
};
