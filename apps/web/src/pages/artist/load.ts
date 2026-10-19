import type { QueryClient } from "@tanstack/react-query";

import { artistQueries } from "@/entities/artist";

export const loadArtist = async (queryClient: QueryClient, artistId: number) => {
  await queryClient.ensureQueryData(artistQueries.get.queryOptions(artistId));
};
