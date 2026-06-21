import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";

const topTracksQuery = query.tracks.top.queryOptions({ size: 50 });

export const Route = createFileRoute("/app/$packageId/tracks")({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    return queryClient.ensureQueryData(topTracksQuery);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(topTracksQuery);

  return (
    <div>
      <Header title="Tracks" />
      <CatalogTable catalog={data} />
    </div>
  );
}
