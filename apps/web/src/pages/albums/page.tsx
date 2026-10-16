import { useQuery } from "@tanstack/react-query";

import { albumQueries } from "@/entities/album";
import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { CatalogTable } from "@/shared/primitives/catalog";
import { Pane } from "@/shared/primitives/pane";
import { useScope } from "@/shared/scope";

export const AlbumsPage = () => {
  const filter = useScope();
  const { data, isLoading } = useQuery(albumQueries.top.queryOptions(filter));

  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Albums</Pane.Title>
        <Pane.Sep />
        <ArtistsSelect />
        <Pane.Actions>
          <DateRangeFilter />
        </Pane.Actions>
      </Pane.Header>
      <CatalogTable catalog={data} loading={isLoading} />
    </Pane>
  );
};
