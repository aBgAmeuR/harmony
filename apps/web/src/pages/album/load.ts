import type { QueryClient } from "@tanstack/react-query";

import { albumQueries } from "@/entities/album";

// Starts the query without blocking the navigation: the page handles its loading state.
export const loadAlbum = (queryClient: QueryClient, albumId: number) => {
  void queryClient.prefetchQuery(albumQueries.get.queryOptions(albumId));
};
