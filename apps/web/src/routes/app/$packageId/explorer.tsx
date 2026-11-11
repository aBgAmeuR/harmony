import { createFileRoute } from "@tanstack/react-router";

import { loadExplorer } from "@/pages/explorer/load";
import { ExplorerPage } from "@/pages/explorer/page";
import { parseExplorerSearch } from "@/pages/explorer/search";

export const Route = createFileRoute("/app/$packageId/explorer")({
  ssr: false,
  validateSearch: parseExplorerSearch,
  loaderDeps: ({ search: { track: _track, ...view } }) => view,
  loader: async ({ context: { queryClient }, deps, parentMatchPromise }) => {
    await parentMatchPromise;
    loadExplorer(queryClient, deps);
  },
  component: ExplorerPage,
});
