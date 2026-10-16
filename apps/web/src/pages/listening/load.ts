import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { listeningQueries } from "@/widgets/listening/api";

export const loadListening = async (queryClient: QueryClient) => {
  const filter = readScope();
  await Promise.all([
    queryClient.ensureQueryData(listeningQueries.listeningTime.queryOptions(filter)),
    queryClient.ensureQueryData(listeningQueries.totalStreams.queryOptions(filter)),
    queryClient.ensureQueryData(listeningQueries.activeDays.queryOptions(filter)),
    queryClient.ensureQueryData(listeningQueries.uniqueTracks.queryOptions(filter)),
    queryClient.ensureQueryData(listeningQueries.monthlyActivity.queryOptions(filter)),
    queryClient.ensureQueryData(listeningQueries.daysOfWeek.queryOptions()),
  ]);
};
