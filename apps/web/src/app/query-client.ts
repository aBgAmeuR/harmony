import { isServer, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: isServer ? Infinity : 3_600_000 * 24, // 24 hours
    },
  },
});
