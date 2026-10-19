import type { QueryClient } from "@tanstack/react-query";

import { readScope } from "@/shared/scope";
import { explorerQueries, PAGE_SIZE } from "@/widgets/explorer/api";
import { BY, DEFAULT_SORT, DEFAULT_TAB, type ExplorerSearch } from "@/widgets/explorer/search";

export const loadExplorer = async (queryClient: QueryClient, search: ExplorerSearch) => {
  await queryClient.ensureQueryData(
    explorerQueries.list.queryOptions({
      by: BY[search.tab ?? DEFAULT_TAB],
      scope: readScope(),
      sort: search.sort ?? DEFAULT_SORT,
      search: search.q ?? "",
      limit: PAGE_SIZE,
    }),
  );
};
