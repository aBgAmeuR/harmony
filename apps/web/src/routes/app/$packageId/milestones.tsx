import { createFileRoute } from "@tanstack/react-router";

import { loadMilestones } from "@/pages/milestones/load";
import { MilestonesPage } from "@/pages/milestones/page";
import { parseMilestonesSearch } from "@/widgets/milestones/list";

export const Route = createFileRoute("/app/$packageId/milestones")({
  ssr: false,
  validateSearch: parseMilestonesSearch,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    loadMilestones(queryClient);
  },
  component: MilestonesPage,
});
