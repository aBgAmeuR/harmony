import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { baseQueries } from "@/widgets/base/api";
import { listQuery, PAGE_SIZE, resolveView, type ViewState } from "@/widgets/base/view";

export const loadExplorer = (queryClient: QueryClient, state: ViewState) => {
  const { from, to } = readScope();
  const query = listQuery(resolveView(state), { from, to }, PAGE_SIZE);
  void queryClient.prefetchQuery(baseQueries.list(query));
};
