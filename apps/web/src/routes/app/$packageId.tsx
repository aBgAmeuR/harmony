import { createFileRoute } from "@tanstack/react-router";

import { AppError } from "@/pages/app/error";
import { AppLayout } from "@/pages/app/layout";
import { loadApp } from "@/pages/app/load";
import { AppPending } from "@/pages/app/pending";

export const Route = createFileRoute("/app/$packageId")({
  ssr: false,
  loader: async ({ params }) => {
    await loadApp(params.packageId);
  },
  component: AppLayout,
  pendingComponent: AppPending,
  errorComponent: AppError,
});
