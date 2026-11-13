import { createFileRoute, redirect } from "@tanstack/react-router";

import { formatTrail } from "@/features/detail-panel";

export const Route = createFileRoute("/app/$packageId/albums/$albumId")({
  beforeLoad: ({ params: { packageId, albumId } }) => {
    throw redirect({
      to: "/app/$packageId/explorer",
      params: { packageId },
      search: { base: "albums", detail: formatTrail([{ kind: "album", id: Number(albumId) }]) },
    });
  },
});
