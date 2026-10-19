import type { QueryClient } from "@tanstack/react-query";

import { albumQueries } from "@/entities/album";

export const loadAlbum = async (queryClient: QueryClient, albumId: number) => {
  await queryClient.ensureQueryData(albumQueries.get.queryOptions(albumId));
};
