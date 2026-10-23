import type { QueryClient } from "@tanstack/react-query";

import { artistQueries } from "@/entities/artist";

// Starts the query without blocking the navigation: the page handles its loading state.
export const loadArtist = (queryClient: QueryClient, artistId: number) => {
  void queryClient.prefetchQuery(artistQueries.get.queryOptions(artistId));
};
