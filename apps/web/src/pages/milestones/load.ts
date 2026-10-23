import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { milestoneQueries } from "@/widgets/milestones/api";

// Starts the queries without blocking the navigation: the widgets fill in as data lands.
export const loadMilestones = (queryClient: QueryClient) => {
  const filter = readScope();
  void queryClient.prefetchQuery(milestoneQueries.summary.queryOptions(filter));
  void queryClient.prefetchQuery(milestoneQueries.nextMilestones.queryOptions(filter));
  void queryClient.prefetchQuery(milestoneQueries.streak.queryOptions(filter));
  void queryClient.prefetchQuery(milestoneQueries.sessions.queryOptions(filter));
  void queryClient.prefetchQuery(milestoneQueries.timeline.queryOptions(filter));
  void queryClient.prefetchQuery(milestoneQueries.firsts.queryOptions(filter));
};
