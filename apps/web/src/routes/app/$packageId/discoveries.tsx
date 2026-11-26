import { createFileRoute } from "@tanstack/react-router";

import { loadDiscoveries } from "@/pages/discoveries/load";
import { DiscoveriesPage } from "@/pages/discoveries/page";
import { parseDiscoveriesSearch } from "@/widgets/discoveries/list";

export const Route = createFileRoute("/app/$packageId/discoveries")({
  ssr: false,
  validateSearch: parseDiscoveriesSearch,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    loadDiscoveries(queryClient);
  },
  component: DiscoveriesPage,
});
