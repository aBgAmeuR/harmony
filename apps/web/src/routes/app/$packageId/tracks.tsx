import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";
import { useArtistStore } from "@/lib/stores/artist-store";
import {
  buildInstantRangeQuery,
  useDateRangeStore,
  useInstantRangeQuery,
} from "@/lib/stores/date-range-store";

export const Route = createFileRoute("/app/$packageId/tracks")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const artistId = useArtistStore.getState().artist?.id;
    const { from, to } = buildInstantRangeQuery(useDateRangeStore.getState());
    await queryClient.ensureQueryData(query.tracks.top.queryOptions({ artistId, from, to }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const artistId = useArtistStore((s) => s.artist?.id);
  const { from, to } = useInstantRangeQuery();
  const { data, isLoading } = useQuery(query.tracks.top.queryOptions({ artistId, from, to }));

  return (
    <div>
      <Header title="Tracks" />
      <CatalogTable catalog={data} loading={isLoading} />
    </div>
  );
}
