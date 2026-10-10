import type { QueryClient } from "@tanstack/react-query";

import { clampRange } from "@/data/overview/range";
import { packageQueries } from "@/entities/package";
import { buildInstantRangeQuery, useDateRangeStore } from "@/shared/scope";
import { overviewQueries } from "@/widgets/overview/api";

export const loadOverview = async (queryClient: QueryClient) => {
  const full = buildInstantRangeQuery(useDateRangeStore.getState());
  const period = await queryClient.ensureQueryData(packageQueries.period.queryOptions());
  const range = clampRange(full, period?.endDate);

  await Promise.all([
    queryClient.ensureQueryData(overviewQueries.kpis.queryOptions(range, full)),
    queryClient.ensureQueryData(overviewQueries.topArtists.queryOptions(range)),
    queryClient.ensureQueryData(overviewQueries.topTracks.queryOptions(range)),
    queryClient.ensureQueryData(overviewQueries.topAlbums.queryOptions(range)),
    queryClient.ensureQueryData(overviewQueries.habits.queryOptions(range)),
    queryClient.ensureQueryData(overviewQueries.behavior.queryOptions(range)),
    queryClient.ensureQueryData(overviewQueries.highlights.queryOptions(range)),
  ]);
};
