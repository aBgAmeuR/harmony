import type { QueryClient } from "@tanstack/react-query";

import { clampRange } from "@/data/overview/range";
import { packageQueries } from "@/entities/package/api";
import { buildInstantRangeQuery, useDateRangeStore } from "@/shared/scope";
import { overviewQueries } from "@/widgets/overview/api";

// Only the period is awaited, the query keys depend on it. The rest starts in page order
// without blocking the navigation: each widget shows its placeholder until its data lands.
export const loadOverview = async (queryClient: QueryClient) => {
  const full = buildInstantRangeQuery(useDateRangeStore.getState());
  const period = await queryClient.ensureQueryData(packageQueries.period.queryOptions());
  const range = clampRange(full, period?.endDate);

  void queryClient.prefetchQuery(overviewQueries.kpis.queryOptions(range, full));
  void queryClient.prefetchQuery(overviewQueries.highlights.queryOptions(range));
  void queryClient.prefetchQuery(overviewQueries.topTracks.queryOptions(range));
  void queryClient.prefetchQuery(overviewQueries.topAlbums.queryOptions(range));
  void queryClient.prefetchQuery(overviewQueries.topArtists.queryOptions(range));
};
