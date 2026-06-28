import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";

const topAlbumsQuery = query.albums.top.queryOptions({});

export const Route = createFileRoute("/app/$packageId/albums")({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    return queryClient.ensureQueryData(topAlbumsQuery);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(topAlbumsQuery);

  return (
    <div>
      <Header title="Albums" />
      <CatalogTable catalog={data} />
    </div>
  );
}
