import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { itemQueries, loadItem } from "@/widgets/item/api";

export const loadAlbum = (queryClient: QueryClient, albumId: number) => {
  loadItem(queryClient, { kind: "album", id: albumId });
  const { from, to } = readScope();
  void queryClient.prefetchQuery(itemQueries.albumTracks({ albumId, range: { from, to } }));
};
