import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";

const topArtistsQuery = query.artists.top.queryOptions({ size: 50 });

export const Route = createFileRoute("/app/$packageId/artists")({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    return queryClient.ensureQueryData(topArtistsQuery);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(topArtistsQuery);

  return (
    <div>
      <Header title="Artists" />
      <CatalogTable catalog={data} />
    </div>
  );
}
