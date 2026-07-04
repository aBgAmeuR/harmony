import { queryOptions } from "@tanstack/react-query";

import { topAlbumsFn } from "./queries/top";

export const albumsQueries = {
  top: {
    queryOptions: ({ artistId }: { artistId?: number }) =>
      queryOptions({
        queryKey: ["albums", "top", { artistId }],
        queryFn: () => topAlbumsFn({ artistId }),
      }),
  },
};
