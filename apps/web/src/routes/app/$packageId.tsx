import { createFileRoute } from "@tanstack/react-router";

import { parseDetailSearch } from "@/features/detail-panel";
import { AppError } from "@/pages/app/error";
import { AppLayout } from "@/pages/app/layout";
import { loadApp } from "@/pages/app/load";
import { AppPending } from "@/pages/app/pending";

export const Route = createFileRoute("/app/$packageId")({
  ssr: false,
  validateSearch: parseDetailSearch,
  loader: async ({ context: { queryClient }, params }) => {
    await loadApp(queryClient, params.packageId);
  },
  component: AppLayout,
  pendingComponent: AppPending,
  errorComponent: AppError,
});
