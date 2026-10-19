import { createFileRoute, redirect } from "@tanstack/react-router";

// The artist list moved into the Explorer.
export const Route = createFileRoute("/app/$packageId/artists/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/app/$packageId/explorer", params, search: { tab: "artists" } });
  },
});
