import { createFileRoute } from "@tanstack/react-router";

import { loadAlbums } from "@/pages/albums/load";
import { AlbumsPage } from "@/pages/albums/page";

export const Route = createFileRoute("/app/$packageId/albums")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadAlbums(queryClient);
  },
  component: AlbumsPage,
});
