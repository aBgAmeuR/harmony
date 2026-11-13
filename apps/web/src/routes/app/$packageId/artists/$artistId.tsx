import { createFileRoute, redirect } from "@tanstack/react-router";

import { formatTrail } from "@/features/detail-panel";

export const Route = createFileRoute("/app/$packageId/artists/$artistId")({
  beforeLoad: ({ params: { packageId, artistId } }) => {
    throw redirect({
      to: "/app/$packageId/explorer",
      params: { packageId },
      search: { base: "artists", detail: formatTrail([{ kind: "artist", id: Number(artistId) }]) },
    });
  },
});
