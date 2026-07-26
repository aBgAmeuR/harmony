import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane";
import { query } from "@/lib/query";
import {
  buildInstantRangeQuery,
  useDateRangeStore,
  useInstantRangeQuery,
} from "@/lib/stores/date-range-store";

export const Route = createFileRoute("/app/$packageId/artists")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const { from, to } = buildInstantRangeQuery(useDateRangeStore.getState());
    await queryClient.ensureQueryData(query.artists.top.queryOptions({ from, to }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { from, to } = useInstantRangeQuery();
  const { data, isLoading } = useQuery(query.artists.top.queryOptions({ from, to }));

  return (
    <Pane>
      <Pane.Header title="Artists" artistSelect={false}>
        <DateRangeFilter />
      </Pane.Header>
      <CatalogTable catalog={data} loading={isLoading} />
    </Pane>
  );
}
