import { createFileRoute } from "@tanstack/react-router";

import { loadDiscoveries } from "@/pages/discoveries/load";
import { DiscoveriesPage } from "@/pages/discoveries/page";

export const Route = createFileRoute("/app/$packageId/discoveries")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadDiscoveries(queryClient);
  },
  component: DiscoveriesPage,
});
