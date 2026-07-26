import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { Catalog } from "@/components/catalog/catalog";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane/pane";
import { TrackDetailsPanel } from "@/features/tracks/components/track-details-panel";
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
  const trackIds = data?.map((track) => track.id) ?? [];
  const { data: trends } = useQuery(query.tracks.trends.queryOptions({ trackIds, from, to }));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [artistId, from, to]);

  const { data: trackDetails, isLoading: detailsLoading } = useQuery(
    query.tracks.get.queryOptions(selectedId),
  );

  const showDetails = selectedId !== null;

  const handleSelectItem = (item: Catalog) => {
    if (item.id === selectedId) return;
    setSelectedId(item.id);
  };

  return (
    <Pane layoutId="harmony:tracks-layout:v1">
      <Pane.Frame id="table">
        <Pane.Header title="Tracks" artistSelect>
          <DateRangeFilter />
        </Pane.Header>
        <Pane.ScrollArea>
          <CatalogTable
            catalog={data}
            loading={isLoading}
            selectedId={selectedId ?? undefined}
            onSelectItem={handleSelectItem}
            stickyHeader
            trends={trends ?? {}}
          />
        </Pane.ScrollArea>
      </Pane.Frame>
      <Pane.Frame id="details" show={showDetails} size={{ default: 300, min: 300, max: 500 }}>
        <TrackDetailsPanel
          track={trackDetails ?? undefined}
          loading={detailsLoading}
          onClose={() => setSelectedId(null)}
        />
      </Pane.Frame>
    </Pane>
  );
}
