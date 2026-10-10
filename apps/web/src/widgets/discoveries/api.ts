import { queryOptions } from "@tanstack/react-query";

import type { Scope } from "@/shared/scope";

import { artistReleasesFn } from "@/data/discoveries/artist-releases";
import { weeklyActivityFn } from "@/data/discoveries/weekly-activity";

export const discoveryQueries = {
  weeklyActivity: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["discoveries", "weekly-activity", filter],
        queryFn: () => weeklyActivityFn(filter),
        enabled: filter.artistId != null,
      }),
  },
  artistReleases: {
    queryOptions: (filter: Scope) =>
      queryOptions({
        queryKey: ["discoveries", "artist-releases", filter],
        queryFn: () => artistReleasesFn(filter),
        enabled: filter.artistId != null,
      }),
  },
};
