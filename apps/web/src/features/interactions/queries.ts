import { queryOptions } from "@tanstack/react-query";

import { monthlyListensFn } from "./queries/monthly-listens";

export const interactionsQueries = {
  monthlyListens: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["interactions", "monthly-listens"],
        queryFn: () => monthlyListensFn(),
      }),
  },
};
