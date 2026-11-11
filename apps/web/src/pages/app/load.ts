import type { QueryClient } from "@tanstack/react-query";

import { openFn } from "@/data/packages/open";

// Query keys do not name the package, so results of the previous one are dropped.
export const loadApp = async (queryClient: QueryClient, packageId: string) => {
  if (await openFn(packageId)) queryClient.clear();
};
