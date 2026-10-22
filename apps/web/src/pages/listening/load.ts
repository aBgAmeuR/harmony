import type { QueryClient } from "@tanstack/react-query";

import { overTimeUnitFor } from "@/data/listening/over-time";
import { readScope } from "@/shared/scope";
import { listeningQueries } from "@/widgets/listening/api";

// Starts the queries without blocking the navigation: the widgets fill in as data lands.
export const loadListening = (queryClient: QueryClient) => {
  const filter = readScope();
  void queryClient.prefetchQuery(listeningQueries.listeningTime.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.totalStreams.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.activeDays.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.uniqueTracks.queryOptions(filter));
  void queryClient.prefetchQuery(
    listeningQueries.overTime.queryOptions(filter, overTimeUnitFor(filter.from, filter.to)),
  );
  void queryClient.prefetchQuery(listeningQueries.rhythm.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.listeningStyle.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.platforms.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.releaseYear.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.genres.queryOptions(filter));
  void queryClient.prefetchQuery(listeningQueries.trackEngagement.queryOptions(filter));
};
