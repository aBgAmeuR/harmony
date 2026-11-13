import { createFileRoute, redirect } from "@tanstack/react-router";

import { formatTrail } from "@/features/detail-panel";

export const Route = createFileRoute("/app/$packageId/genres/$genre")({
  beforeLoad: ({ params: { packageId, genre } }) => {
    throw redirect({
      to: "/app/$packageId/explorer",
      params: { packageId },
      search: { base: "genres", detail: formatTrail([{ kind: "genre", id: genre }]) },
    });
  },
});
