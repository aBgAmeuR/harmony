import { queryOptions } from "@tanstack/react-query";

import { toSqlDate } from "@/lib/sql/date-range";

import { getTrackFn } from "./queries/get";
import { topTracksFn } from "./queries/top";

export const tracksQueries = {
  top: {
    queryOptions: ({ artistId, from, to }: { artistId?: number; from: Date; to: Date }) =>
      queryOptions({
        queryKey: ["tracks", "top", { artistId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => topTracksFn({ artistId, from, to }),
      }),
  },
  get: {
    queryOptions: (trackId: number | null) =>
      queryOptions({
        queryKey: ["tracks", "get", trackId],
        queryFn: () => (trackId ? getTrackFn(trackId) : null),
        enabled: trackId !== null,
      }),
  },
};
