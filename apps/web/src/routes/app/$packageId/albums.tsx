import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane";
import { query } from "@/lib/query";
import { useArtistStore } from "@/lib/stores/artist-store";
import {
  buildInstantRangeQuery,
  useDateRangeStore,
  useInstantRangeQuery,
} from "@/lib/stores/date-range-store";

export const Route = createFileRoute("/app/$packageId/albums")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const artistId = useArtistStore.getState().artist?.id;
    const { from, to } = buildInstantRangeQuery(useDateRangeStore.getState());
    await queryClient.ensureQueryData(query.albums.top.queryOptions({ artistId, from, to }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const artistId = useArtistStore((s) => s.artist?.id);
  const { from, to } = useInstantRangeQuery();
  const { data, isLoading } = useQuery(query.albums.top.queryOptions({ artistId, from, to }));

  return (
    <Pane>
      <Pane.Header title="Albums" artistSelect>
        <DateRangeFilter />
      </Pane.Header>
      <CatalogTable catalog={data} loading={isLoading} />
    </Pane>
  );
}
