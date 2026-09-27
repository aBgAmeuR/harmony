import { queryOptions } from "@tanstack/react-query";

import { uploadClient } from "@/lib/upload";

export const uploadQueries = {
  serverConfig: queryOptions({
    queryKey: ["upload", "server-config"],
    queryFn: () => uploadClient.serverConfig(),
  }),
};
