import type { QueryClient } from "@tanstack/react-query";

import { unitFor } from "@/data/aggregate";
import { rangeDays } from "@/shared/lib/date";
import { readScope } from "@/shared/scope";
import { listeningQueries } from "@/widgets/listening/api";

// Starts the queries without blocking the navigation: the widgets fill in as data lands.
export const loadListening = (queryClient: QueryClient) => {
  const scope = readScope();
  for (const measure of ["playtime", "streams", "days", "tracks"] as const) {
    void queryClient.prefetchQuery(listeningQueries.metric({ scope, measure }));
  }
  void queryClient.prefetchQuery(
    listeningQueries.overTime({ scope, unit: unitFor(rangeDays(scope)) }),
  );
  void queryClient.prefetchQuery(listeningQueries.rhythm(scope));
  void queryClient.prefetchQuery(listeningQueries.style(scope));
  void queryClient.prefetchQuery(listeningQueries.platforms(scope));
  void queryClient.prefetchQuery(listeningQueries.releaseYear(scope));
  void queryClient.prefetchQuery(listeningQueries.genres(scope));
  void queryClient.prefetchQuery(listeningQueries.replays(scope));
};
