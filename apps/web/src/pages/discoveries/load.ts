import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { discoveryQueries } from "@/widgets/discoveries/api";

export const loadDiscoveries = (queryClient: QueryClient) => {
  const { from, to } = readScope();
  const range = { from, to };
  void queryClient.prefetchQuery(discoveryQueries.summary(range));
  void queryClient.prefetchQuery(discoveryQueries.found(range));
  void queryClient.prefetchQuery(discoveryQueries.returns(range));
  void queryClient.prefetchQuery(discoveryQueries.atRelease(range));
};
