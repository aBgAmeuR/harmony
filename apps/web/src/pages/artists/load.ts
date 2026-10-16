import type { QueryClient } from "@tanstack/react-query";

import { artistQueries } from "@/entities/artist";
import { readScope } from "@/shared/scope";

export const loadArtists = async (queryClient: QueryClient) => {
  const filter = readScope();
  await queryClient.ensureQueryData(artistQueries.top.queryOptions(filter));
};
