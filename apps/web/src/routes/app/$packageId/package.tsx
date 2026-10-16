import { createFileRoute } from "@tanstack/react-router";

import { loadPackage } from "@/pages/package/load";
import { PackagePage } from "@/pages/package/page";

export const Route = createFileRoute("/app/$packageId/package")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise, params }) => {
    await parentMatchPromise;
    await loadPackage(queryClient, params.packageId);
  },
  component: PackagePage,
});
