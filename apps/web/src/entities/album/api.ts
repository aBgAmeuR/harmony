import { queryOptions } from "@tanstack/react-query";

import type { Scope } from "@/shared/scope";

import { rankFn } from "@/data/rank";

export const albumQueries = {
  top: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["albums", "top", filter],
        queryFn: () => rankFn({ by: "album", scope: filter }),
      }),
  },
};
