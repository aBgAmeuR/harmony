import type { QueryClient } from "@tanstack/react-query";

import { artistQueries } from "@/entities/artist";
import { readScope } from "@/shared/scope";
import { discoveryQueries } from "@/widgets/discoveries/api";

// Starts the queries without blocking the navigation: the widgets fill in as data lands. Without
// a picked artist, the page previews the top artist of the period.
export const loadDiscoveries = (queryClient: QueryClient) => {
  const scope = readScope();
  if (scope.artistId === undefined) {
    void queryClient.prefetchQuery(artistQueries.top(scope));
    return;
  }
  void queryClient.prefetchQuery(discoveryQueries.weekly(scope));
  void queryClient.prefetchQuery(discoveryQueries.releases(scope));
};
