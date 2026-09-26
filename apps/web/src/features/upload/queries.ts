import { queryOptions } from "@tanstack/react-query";

import { createUploadClient } from "@/lib/upload";

export const uploadQueries = {
  serverConfig: {
    queryOptions: (apiUrl: string) =>
      queryOptions({
        queryKey: ["upload", "server-config", apiUrl],
        queryFn: () => createUploadClient(apiUrl).serverConfig(),
      }),
  },
};
