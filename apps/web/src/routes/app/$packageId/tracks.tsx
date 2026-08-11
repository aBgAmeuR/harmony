import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { Catalog } from "@/components/catalog/catalog";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane";
import { TrackDetailsPanel } from "@/features/tracks/components/track-details-panel";
import { readFilter, useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

export const Route = createFileRoute("/app/$packageId/tracks")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const filter = readFilter();
    await queryClient.ensureQueryData(query.tracks.top.queryOptions(filter));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const filter = useFilter();
  const { data, isLoading } = useQuery(query.tracks.top.queryOptions(filter));
  const trackIds = data?.map((track) => track.id) ?? [];
  const { data: trends } = useQuery(query.tracks.trends.queryOptions({ trackIds, ...filter }));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [filter.artistId, filter.from, filter.to]);

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
