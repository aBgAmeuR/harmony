import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { CatalogItem } from "@/shared/primitives/catalog";

import { trackQueries } from "@/entities/track";
import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { CatalogTable } from "@/shared/primitives/catalog";
import { Pane } from "@/shared/primitives/pane";
import { useScope } from "@/shared/scope";
import { TrackDetailsPanel } from "@/widgets/track-details/track-details-panel";

export const TracksPage = () => {
  const filter = useScope();
  const { data, isLoading } = useQuery(trackQueries.top.queryOptions(filter));
  const trackIds = data?.map((track) => track.id) ?? [];
  const { data: trends } = useQuery(trackQueries.trends.queryOptions({ trackIds, ...filter }));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [filter.artistId, filter.from, filter.to]);

  const { data: trackDetails, isLoading: detailsLoading } = useQuery(
    trackQueries.get.queryOptions(selectedId),
  );

  const showDetails = selectedId !== null;

  const handleSelectItem = (item: CatalogItem) => {
    if (item.id === selectedId) return;
    setSelectedId(item.id);
  };

  return (
    <Pane layoutId="harmony:tracks-layout:v1">
      <Pane.Frame id="table">
        <Pane.Header>
          <Pane.Title>Tracks</Pane.Title>
          <Pane.Sep />
          <ArtistsSelect />
          <Pane.Actions>
            <DateRangeFilter />
          </Pane.Actions>
        </Pane.Header>
        <Pane.Scroll>
          <CatalogTable
            catalog={data}
            loading={isLoading}
            selectedId={selectedId ?? undefined}
            onSelectItem={handleSelectItem}
            stickyHeader
            trends={trends ?? {}}
          />
        </Pane.Scroll>
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
};
