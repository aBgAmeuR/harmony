import { Spinner } from "@harmony/ui/components/spinner";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import "./index.css";
import { queryClient } from "@/app/query-client";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    defaultPreloadStaleTime: 1000 * 60 * 60, // 1h
    context: { queryClient },
    defaultPendingComponent: () => (
      <div className="flex h-full items-center justify-center pt-8">
        <Spinner />
      </div>
    ),
    defaultPendingMs: 1000,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    Wrap: ({ children }) => <>{children}</>,
  });
  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
