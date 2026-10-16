import { queryOptions } from "@tanstack/react-query";

import { monthlyListensFn } from "@/data/interactions/monthly-listens";
import { trackInteractionsFn } from "@/data/interactions/track-interactions";
import { toSqlDate } from "@/data/sql/date-range";

export const interactionQueries = {
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
