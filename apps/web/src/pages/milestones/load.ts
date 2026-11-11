import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { milestoneQueries } from "@/widgets/milestones/api";

// Starts the queries without blocking the navigation: the widgets fill in as data lands.
export const loadMilestones = (queryClient: QueryClient) => {
  const filter = readScope();
  void queryClient.prefetchQuery(milestoneQueries.summary(filter));
  void queryClient.prefetchQuery(milestoneQueries.next(filter));
  void queryClient.prefetchQuery(milestoneQueries.streak(filter));
  void queryClient.prefetchQuery(milestoneQueries.sessions(filter));
  void queryClient.prefetchQuery(milestoneQueries.timeline(filter));
  void queryClient.prefetchQuery(milestoneQueries.firsts(filter));
};
