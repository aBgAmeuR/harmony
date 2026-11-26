import type { QueryClient } from "@tanstack/react-query";

import { milestoneQueries } from "@/widgets/milestones/api";

export const loadMilestones = (queryClient: QueryClient) => {
  void queryClient.prefetchQuery(milestoneQueries.marks());
  void queryClient.prefetchQuery(milestoneQueries.records());
  void queryClient.prefetchQuery(milestoneQueries.next());
  void queryClient.prefetchQuery(milestoneQueries.curve());
  void queryClient.prefetchQuery(milestoneQueries.streak());
};
