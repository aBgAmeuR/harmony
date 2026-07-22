import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import "./index.css";
import Loader from "./components/loader";
import { getPublicConfig } from "./lib/public-config";
import { queryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

export const getRouter = async () => {
  const config = await getPublicConfig();
  const router = createTanStackRouter({
    routeTree,
    defaultPreloadStaleTime: 1000 * 60 * 60, // 1h
    context: { queryClient, config },
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
