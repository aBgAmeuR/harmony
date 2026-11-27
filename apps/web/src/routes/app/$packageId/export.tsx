import { createFileRoute } from "@tanstack/react-router";

import { loadExport } from "@/pages/export/load";
import { ExportPage } from "@/pages/export/page";
import { parseExport, type ExportState } from "@/widgets/export/state";

export const Route = createFileRoute("/app/$packageId/export")({
  ssr: false,
  validateSearch: (raw: Record<string, unknown>): ExportState => parseExport(raw),
  loaderDeps: ({ search: { detail: _detail, ...state } }) => state,
  loader: async ({ context: { queryClient }, deps, parentMatchPromise }) => {
    await parentMatchPromise;
    loadExport(queryClient, deps);
  },
  component: ExportPage,
});
