import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";
import { useArtistStore } from "@/lib/stores/artist-store";

export const Route = createFileRoute("/app/$packageId/albums")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const artistId = useArtistStore.getState().artist?.id;
    await queryClient.ensureQueryData(
      query.albums.top.queryOptions({ artistId }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const artistId = useArtistStore((s) => s.artist?.id);
  const { data, isLoading } = useQuery(
    query.albums.top.queryOptions({ artistId }),
  );

  return (
    <div>
      <Header title="Albums" />
      <CatalogTable catalog={data} loading={isLoading} />
    </div>
  );
}
