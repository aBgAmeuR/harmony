import { createFileRoute } from "@tanstack/react-router";

import { parseTrack } from "@/features/track-panel";
import { loadGenre } from "@/pages/genre/load";
import { GenrePage } from "@/pages/genre/page";

export const Route = createFileRoute("/app/$packageId/genres/$genre")({
  ssr: false,
  validateSearch: (raw: Record<string, unknown>): { track?: number } => ({
    track: parseTrack(raw.track),
  }),
  loader: async ({ context: { queryClient }, params, parentMatchPromise }) => {
    await parentMatchPromise;
    loadGenre(queryClient, params.genre);
  },
  component: GenrePage,
});
