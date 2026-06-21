import { queryOptions } from "@tanstack/react-query";

import { topArtistsFn } from "./queries/top";

export const artistsQueries = {
  top: {
    queryOptions: ({ size }: { size: number }) =>
      queryOptions({
        queryKey: ["artists", "top", { size }],
        queryFn: () => topArtistsFn({ size }),
      }),
  },
};
