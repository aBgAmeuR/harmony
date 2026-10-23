import { createFileRoute } from "@tanstack/react-router";

import { parseTrack } from "@/entities/track";
import { loadOverview } from "@/pages/overview/load";
import { OverviewPage } from "@/pages/overview/page";

export const Route = createFileRoute("/app/$packageId/")({
  ssr: false,
  validateSearch: (raw: Record<string, unknown>): { track?: number } => ({
    track: parseTrack(raw.track),
  }),
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadOverview(queryClient);
  },
  component: OverviewPage,
});
