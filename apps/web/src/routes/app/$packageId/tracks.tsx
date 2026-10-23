import { createFileRoute, redirect } from "@tanstack/react-router";

// The track list moved into the Explorer.
export const Route = createFileRoute("/app/$packageId/tracks")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/app/$packageId/explorer", params, search: { tab: "tracks" } });
  },
});
