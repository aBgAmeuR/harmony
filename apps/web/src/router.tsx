import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import "./index.css";
import { queryClient } from "@/app/query-client";
import { Loader } from "@/shared/primitives/loader";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    defaultPreloadStaleTime: 1000 * 60 * 60, // 1h
    context: { queryClient },
    defaultPendingComponent: () => <Loader />,
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
