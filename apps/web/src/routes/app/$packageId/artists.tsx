import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";

const topArtistsQuery = query.artists.top.queryOptions({});

export const Route = createFileRoute("/app/$packageId/artists")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await queryClient.ensureQueryData(topArtistsQuery);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery(topArtistsQuery);

  return (
    <div>
      <Header title="Artists" showArtistSelect={false} />
      <CatalogTable catalog={data} loading={isLoading} />
    </div>
  );
}
