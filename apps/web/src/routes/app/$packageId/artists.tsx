import { createFileRoute } from "@tanstack/react-router";

import { loadArtists } from "@/pages/artists/load";
import { ArtistsPage } from "@/pages/artists/page";

export const Route = createFileRoute("/app/$packageId/artists")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadArtists(queryClient);
  },
  component: ArtistsPage,
});
