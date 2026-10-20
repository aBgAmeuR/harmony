import { createFileRoute } from "@tanstack/react-router";

import { parseTrack } from "@/entities/track";
import { loadAlbum } from "@/pages/album/load";
import { AlbumPage } from "@/pages/album/page";

export const Route = createFileRoute("/app/$packageId/albums/$albumId")({
  ssr: false,
  validateSearch: (raw: Record<string, unknown>): { track?: number } => ({
    track: parseTrack(raw.track),
  }),
  loader: async ({ context: { queryClient }, params, parentMatchPromise }) => {
    await parentMatchPromise;
    loadAlbum(queryClient, Number(params.albumId));
  },
  component: AlbumPage,
});
