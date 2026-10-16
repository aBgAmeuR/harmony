import type { QueryClient } from "@tanstack/react-query";

import { trackQueries } from "@/entities/track";
import { readScope } from "@/shared/scope";

export const loadTracks = async (queryClient: QueryClient) => {
  const filter = readScope();
  await queryClient.ensureQueryData(trackQueries.top.queryOptions(filter));
};
