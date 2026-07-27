import { queryOptions } from "@tanstack/react-query";

import type { Filter } from "@/lib/filter";

import { artistReleasesFn } from "./queries/artist-releases";
import { weeklyActivityFn } from "./queries/weekly-activity";

export const discoveriesQueries = {
  weeklyActivity: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["discoveries", "weekly-activity", filter],
        queryFn: () => weeklyActivityFn(filter),
        enabled: filter.artistId != null,
      }),
  },
  artistReleases: {
    queryOptions: (filter: Filter) =>
      queryOptions({
        queryKey: ["discoveries", "artist-releases", filter],
        queryFn: () => artistReleasesFn(filter),
        enabled: filter.artistId != null,
      }),
  },
};
