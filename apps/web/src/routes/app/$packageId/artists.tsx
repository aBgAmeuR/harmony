import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane";
import { readFilter, useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

export const Route = createFileRoute("/app/$packageId/artists")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const filter = readFilter();
    await queryClient.ensureQueryData(query.artists.top.queryOptions(filter));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const filter = useFilter();
  const { data, isLoading } = useQuery(query.artists.top.queryOptions(filter));

  return (
    <Pane>
      <Pane.Header title="Artists" artistSelect={false}>
        <DateRangeFilter />
      </Pane.Header>
      <CatalogTable catalog={data} loading={isLoading} />
    </Pane>
  );
}
