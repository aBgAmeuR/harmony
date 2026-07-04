import { queryOptions } from "@tanstack/react-query";

import { topTracksFn } from "./queries/top";

export const tracksQueries = {
  top: {
    queryOptions: ({ artistId }: { artistId?: number }) =>
      queryOptions({
        queryKey: ["tracks", "top", { artistId }],
        queryFn: () => topTracksFn({ artistId }),
      }),
  },
};
