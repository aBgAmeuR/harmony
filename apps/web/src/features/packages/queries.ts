import { queryOptions } from "@tanstack/react-query";

import { metaFn } from "./queries/meta";
import { periodFn } from "./queries/period";

export const packagesQueries = {
  meta: {
    queryOptions: (packageId: string) =>
      queryOptions({
        queryKey: ["packages", "meta", packageId],
        queryFn: () => metaFn(),
      }),
  },
  period: {
    queryOptions: () =>
      queryOptions({
        queryKey: ["packages", "period"],
        queryFn: () => periodFn(),
      }),
  },
};
