import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { milestoneQueries } from "@/widgets/milestones/api";

export const loadMilestones = async (queryClient: QueryClient) => {
  const filter = readScope();
  await Promise.all([
    queryClient.ensureQueryData(milestoneQueries.summary.queryOptions(filter)),
    queryClient.ensureQueryData(milestoneQueries.nextMilestones.queryOptions(filter)),
    queryClient.ensureQueryData(milestoneQueries.streak.queryOptions(filter)),
    queryClient.ensureQueryData(milestoneQueries.sessions.queryOptions(filter)),
    queryClient.ensureQueryData(milestoneQueries.timeline.queryOptions(filter)),
    queryClient.ensureQueryData(milestoneQueries.firsts.queryOptions(filter)),
  ]);
};
