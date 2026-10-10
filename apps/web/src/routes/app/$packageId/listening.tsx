import { createFileRoute } from "@tanstack/react-router";

import { loadListening } from "@/pages/listening/load";
import { ListeningPage } from "@/pages/listening/page";

export const Route = createFileRoute("/app/$packageId/listening")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await loadListening(queryClient);
  },
  component: ListeningPage,
});
