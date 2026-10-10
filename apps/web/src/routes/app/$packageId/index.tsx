import { createFileRoute } from "@tanstack/react-router";

import { loadOverview } from "@/pages/overview/load";
import { OverviewPage } from "@/pages/overview/page";

export const Route = createFileRoute("/app/$packageId/")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadOverview(queryClient);
  },
  component: OverviewPage,
});
