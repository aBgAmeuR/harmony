import type { QueryClient } from "@tanstack/react-query";

import { loadItem } from "@/widgets/item/api";

export const loadArtist = (queryClient: QueryClient, artistId: number) =>
  loadItem(queryClient, { kind: "artist", id: artistId });
