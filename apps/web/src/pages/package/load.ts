import type { QueryClient } from "@tanstack/react-query";

import { packageQueries } from "@/entities/package";

export const loadPackage = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.ensureQueryData(packageQueries.meta()),
    queryClient.ensureQueryData(packageQueries.period()),
  ]);
};
