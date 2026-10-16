import type { QueryClient } from "@tanstack/react-query";

import { albumQueries } from "@/entities/album";
import { readScope } from "@/shared/scope";

export const loadAlbums = async (queryClient: QueryClient) => {
  const filter = readScope();
  await queryClient.ensureQueryData(albumQueries.top.queryOptions(filter));
};
