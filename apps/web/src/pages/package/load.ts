import type { QueryClient } from "@tanstack/react-query";

import { packageQueries } from "@/entities/package";

const periodQuery = packageQueries.period.queryOptions();

export const loadPackage = async (queryClient: QueryClient, packageId: string) => {
  await Promise.all([
    queryClient.ensureQueryData(packageQueries.meta.queryOptions(packageId)),
    queryClient.ensureQueryData(periodQuery),
  ]);
};
