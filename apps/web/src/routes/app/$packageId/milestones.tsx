import { createFileRoute } from "@tanstack/react-router";

import { loadMilestones } from "@/pages/milestones/load";
import { MilestonesPage } from "@/pages/milestones/page";

export const Route = createFileRoute("/app/$packageId/milestones")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadMilestones(queryClient);
  },
  component: MilestonesPage,
});
