import { queryOptions } from "@tanstack/react-query";

import { toSqlDate } from "@/lib/sql/date-range";

import { topAlbumsFn } from "./queries/top";

export const albumsQueries = {
  top: {
    queryOptions: ({ artistId, from, to }: { artistId?: number; from: Date; to: Date }) =>
      queryOptions({
        queryKey: ["albums", "top", { artistId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => topAlbumsFn({ artistId, from, to }),
      }),
  },
};
