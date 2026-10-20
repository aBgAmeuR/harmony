import { createFileRoute } from "@tanstack/react-router";

import { loadExplorer } from "@/pages/explorer/load";
import { ExplorerPage } from "@/pages/explorer/page";
import { parseExplorerSearch } from "@/widgets/explorer/search";

export const Route = createFileRoute("/app/$packageId/explorer")({
  ssr: false,
  validateSearch: parseExplorerSearch,
  loaderDeps: ({ search: { tab, sort, q } }) => ({ tab, sort, q }),
  loader: async ({ context: { queryClient }, deps, parentMatchPromise }) => {
    await parentMatchPromise;
    loadExplorer(queryClient, deps);
  },
  component: ExplorerPage,
});
