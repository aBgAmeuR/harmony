import { queryOptions } from "@tanstack/react-query";

import { periodFn } from "./queries/period";

export const packagesQueries = {
  period: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["packages", "period"],
        queryFn: () => periodFn(),
      }),
  },
};
