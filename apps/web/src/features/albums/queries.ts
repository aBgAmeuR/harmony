import { queryOptions } from "@tanstack/react-query";

import { topAlbumsFn } from "./queries/top";

export const albumsQueries = {
  top: {
    queryOptions: ({ size = 50 }: { size?: number }) =>
      queryOptions({
        queryKey: ["albums", "top", { size }],
        queryFn: () => topAlbumsFn({ size }),
      }),
  },
};
