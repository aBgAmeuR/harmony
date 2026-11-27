import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { exportQueries } from "@/widgets/export/api";
import { resolveExport, type ExportState } from "@/widgets/export/state";

export const loadExport = (queryClient: QueryClient, state: ExportState) => {
  const { from, to } = readScope();
  const { rules, sort, desc } = resolveExport(state);
  void queryClient.prefetchInfiniteQuery(exportQueries.rows({ from, to, rules, sort, desc }));
  void queryClient.prefetchQuery(exportQueries.count({ from, to, rules }));
};
