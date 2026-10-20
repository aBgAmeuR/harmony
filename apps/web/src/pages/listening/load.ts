import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { listeningQueries } from "@/widgets/listening/api";

// Starts the queries without blocking the navigation: the widgets fill in as data lands.
export const loadListening = (queryClient: QueryClient) => {
  const filter = readScope();
  void queryClient.prefetchQuery(listeningQueries.listeningTime.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.totalStreams.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.activeDays.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.uniqueTracks.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.monthlyActivity.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.daysOfWeek.queryOptions());
};
