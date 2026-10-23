import { queryOptions } from "@tanstack/react-query";

import { albumKpisFn, albumTracksFn, getAlbumFn } from "@/data/albums/album";
import { toSqlDate } from "@/data/sql/date-range";

type AlbumRange = { albumId: number; from: Date; to: Date };

const rangeKey = ({ albumId, from, to }: AlbumRange) => ({
  albumId,
  from: toSqlDate(from),
  to: toSqlDate(to),
});

export const albumQueries = {
  get: {
    queryOptions: (albumId: number) =>
      queryOptions({
        queryKey: ["albums", "get", albumId],
        queryFn: () => getAlbumFn(albumId),
      }),
  },
  kpis: {
    queryOptions: (args: AlbumRange) =>
      queryOptions({
        queryKey: ["albums", "kpis", rangeKey(args)],
        queryFn: () => albumKpisFn(args),
      }),
  },
  tracks: {
    queryOptions: (args: AlbumRange) =>
      queryOptions({
        queryKey: ["albums", "tracks", rangeKey(args)],
        queryFn: () => albumTracksFn(args),
      }),
  },
};
