import { createFileRoute } from "@tanstack/react-router";

import { parseTrack } from "@/entities/track";
import { loadArtist } from "@/pages/artist/load";
import { ArtistPage } from "@/pages/artist/page";

export const Route = createFileRoute("/app/$packageId/artists/$artistId")({
  ssr: false,
  validateSearch: (raw: Record<string, unknown>): { track?: number } => ({
    track: parseTrack(raw.track),
  }),
  loader: async ({ context: { queryClient }, params, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadArtist(queryClient, Number(params.artistId));
  },
  component: ArtistPage,
});
