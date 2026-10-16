import { createFileRoute } from "@tanstack/react-router";

import { loadTracks } from "@/pages/tracks/load";
import { TracksPage } from "@/pages/tracks/page";

export const Route = createFileRoute("/app/$packageId/tracks")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadTracks(queryClient);
  },
  component: TracksPage,
});
