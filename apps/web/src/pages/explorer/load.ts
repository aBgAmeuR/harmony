import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { explorerQueries, PAGE_SIZE } from "@/widgets/explorer/api";
import { BY, DEFAULT_SORT, DEFAULT_TAB, type ExplorerSearch } from "@/widgets/explorer/search";

// Starts the query without blocking the navigation: the list shows its loading state meanwhile.
export const loadExplorer = (queryClient: QueryClient, search: ExplorerSearch) => {
  void queryClient.prefetchQuery(
    explorerQueries.list.queryOptions({
      by: BY[search.tab ?? DEFAULT_TAB],
      scope: readScope(),
      sort: search.sort ?? DEFAULT_SORT,
      search: search.q ?? "",
      limit: PAGE_SIZE,
    }),
  );
};
