import type { QueryClient } from "@tanstack/react-query";

import { packageQueries } from "@/entities/package";
import { clampRange } from "@/shared/lib/date";
import { readScope } from "@/shared/scope";
import { overviewQueries, TOP } from "@/widgets/overview/api";

// Only the period is awaited, the query keys depend on it. The rest starts in page order
// without blocking the navigation: each widget shows its placeholder until its data lands.
export const loadOverview = async (queryClient: QueryClient) => {
  const { from, to } = readScope();
  const full = { from, to };
  const period = await queryClient.ensureQueryData(packageQueries.period());
  const range = clampRange(full, period?.endDate);

  void queryClient.prefetchQuery(overviewQueries.kpis({ range, full }));
  void queryClient.prefetchQuery(overviewQueries.highlights(range));
  for (const base of ["tracks", "albums", "artists"] as const) {
    void queryClient.prefetchQuery(overviewQueries.top({ base, filter: range, limit: TOP }));
  }
};
