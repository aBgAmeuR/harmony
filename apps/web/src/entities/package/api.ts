import { queryOptions } from "@tanstack/react-query";

import { metaFn } from "@/data/packages/meta";
import { periodFn } from "@/data/packages/period";

export const packageQueries = {
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
