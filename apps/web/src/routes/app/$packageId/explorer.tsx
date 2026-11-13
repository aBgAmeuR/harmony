import { createFileRoute } from "@tanstack/react-router";

import { loadExplorer } from "@/pages/explorer/load";
import { ExplorerPage } from "@/pages/explorer/page";
import { parseView, type ViewState } from "@/widgets/base/view";

export const Route = createFileRoute("/app/$packageId/explorer")({
  ssr: false,
  validateSearch: (raw: Record<string, unknown>): ViewState => parseView(raw),
  loaderDeps: ({ search: { detail: _detail, ...view } }) => view,
  loader: async ({ context: { queryClient }, deps, parentMatchPromise }) => {
    await parentMatchPromise;
    loadExplorer(queryClient, deps);
  },
  component: ExplorerPage,
});
