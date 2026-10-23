import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { discoveryQueries } from "@/widgets/discoveries/api";

// Starts the queries without blocking the navigation: the widgets fill in as data lands.
export const loadDiscoveries = (queryClient: QueryClient) => {
  const filter = readScope();
  if (filter.artistId == null) return;

  void queryClient.prefetchQuery(discoveryQueries.weeklyActivity.queryOptions(filter));
  void queryClient.prefetchQuery(discoveryQueries.artistReleases.queryOptions(filter));
};
