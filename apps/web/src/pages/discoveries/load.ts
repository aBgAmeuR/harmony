import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { discoveryQueries } from "@/widgets/discoveries/api";

export const loadDiscoveries = async (queryClient: QueryClient) => {
  const filter = readScope();
  if (filter.artistId == null) return;

  await Promise.all([
    queryClient.ensureQueryData(discoveryQueries.weeklyActivity.queryOptions(filter)),
    queryClient.ensureQueryData(discoveryQueries.artistReleases.queryOptions(filter)),
  ]);
};
