import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDefaultLayout,
} from "@harmony/ui/components/resizable";
import { ScrollArea } from "@harmony/ui/components/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { Catalog } from "@/components/catalog/catalog";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { Header } from "@/components/layout/header/header";
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

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "harmony:tracks-layout:v1",
    panelIds: showDetails ? ["table", "details"] : ["table"],
    storage: localStorage,
  });

  const handleSelectItem = (item: Catalog) => {
    if (item.id === selectedId) return;
    setSelectedId(item.id);
  };

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <Header title="Tracks" />
      <ResizablePanelGroup
        className="min-h-0 flex-1"
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        <ResizablePanel id="table" className="min-h-0 min-w-0">
          <ScrollArea className="h-full overflow-hidden">
            <CatalogTable
              catalog={data}
              loading={isLoading}
              selectedId={selectedId ?? undefined}
              onSelectItem={handleSelectItem}
              stickyHeader
              trends={trends ?? {}}
            />
          </ScrollArea>
        </ResizablePanel>
        {showDetails && (
          <>
            <ResizableHandle />
            <ResizablePanel id="details" defaultSize={300} minSize={300} maxSize={500}>
              <TrackDetailsPanel
                track={trackDetails ?? undefined}
                loading={detailsLoading}
                onClose={() => setSelectedId(null)}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
