import { useQuery } from "@tanstack/react-query";

import { artistQueries } from "@/entities/artist";
import { DateRangeFilter } from "@/features/filter-period";
import { CatalogTable } from "@/shared/primitives/catalog";
import { Pane } from "@/shared/primitives/pane";
import { useScope } from "@/shared/scope";

export const ArtistsPage = () => {
  const filter = useScope();
  const { data, isLoading } = useQuery(artistQueries.top.queryOptions(filter));

  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Artists</Pane.Title>
        <Pane.Actions>
          <DateRangeFilter />
        </Pane.Actions>
      </Pane.Header>
      <CatalogTable catalog={data} loading={isLoading} />
    </Pane>
  );
};
