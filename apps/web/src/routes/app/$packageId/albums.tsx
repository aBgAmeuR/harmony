import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane";
import { readFilter, useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

export const Route = createFileRoute("/app/$packageId/albums")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const filter = readFilter();
    await queryClient.ensureQueryData(query.albums.top.queryOptions(filter));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const filter = useFilter();
  const { data, isLoading } = useQuery(query.albums.top.queryOptions(filter));

  return (
    <Pane>
      <Pane.Header title="Albums" artistSelect>
        <DateRangeFilter />
      </Pane.Header>
      <CatalogTable catalog={data} loading={isLoading} />
    </Pane>
  );
}
