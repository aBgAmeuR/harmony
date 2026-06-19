import { queryOptions } from '@tanstack/react-query'
import { runDuckQuery } from './run'
import { buildTopAlbumsSql, buildTopArtistsSql, buildTopTracksSql } from './sql'
import type { DuckCatalogRow, TopCatalogInput } from './types'

export const query = {
  tracks: {
    top: {
      queryOptions: (input: TopCatalogInput) =>
        queryOptions({
          queryKey: ['duck', 'tracks', 'top', input],
          queryFn: () => runDuckQuery<DuckCatalogRow>(buildTopTracksSql(input)),
        }),
    },
  },
  albums: {
    top: {
      queryOptions: (input: TopCatalogInput) =>
        queryOptions({
          queryKey: ['duck', 'albums', 'top', input],
          queryFn: () => runDuckQuery<DuckCatalogRow>(buildTopAlbumsSql(input)),
        }),
    },
  },
  artists: {
    top: {
      queryOptions: (input: TopCatalogInput) =>
        queryOptions({
          queryKey: ['duck', 'artists', 'top', input],
          queryFn: () => runDuckQuery<DuckCatalogRow>(buildTopArtistsSql(input)),
        }),
    },
  },
} as const
