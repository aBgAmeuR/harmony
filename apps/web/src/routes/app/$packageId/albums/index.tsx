import { createFileRoute, redirect } from "@tanstack/react-router";

// The album list moved into the Explorer.
export const Route = createFileRoute("/app/$packageId/albums/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/app/$packageId/explorer", params, search: { tab: "albums" } });
  },
});
