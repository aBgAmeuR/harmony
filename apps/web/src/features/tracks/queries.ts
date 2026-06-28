import { queryOptions } from "@tanstack/react-query";

import { topTracksFn } from "./queries/top";

export const tracksQueries = {
  top: {
    queryOptions: ({ size = 50 }: { size?: number }) =>
      queryOptions({
        queryKey: ["tracks", "top", { size }],
        queryFn: () => topTracksFn({ size }),
      }),
  },
};
