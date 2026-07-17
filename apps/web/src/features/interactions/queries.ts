import { queryOptions } from "@tanstack/react-query";

import { toSqlDate } from "@/lib/sql/date-range";

import { monthlyListensFn } from "./queries/monthly-listens";
import { trackInteractionsFn } from "./queries/track-interactions";

export const interactionsQueries = {
  monthlyListens: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["interactions", "monthly-listens"],
        queryFn: () => monthlyListensFn(),
      }),
  },
  track: {
    queryOptions: ({ trackId, from, to }: { trackId: number; from: Date; to: Date }) =>
      queryOptions({
        queryKey: ["interactions", "track", { trackId, from: toSqlDate(from), to: toSqlDate(to) }],
        queryFn: () => trackInteractionsFn({ trackId, from, to }),
      }),
  },
};
