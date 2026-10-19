import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { RankBy, RankSort } from "@/data/rank";
import type { Scope } from "@/shared/scope";

import { explorerListFn, type ExplorerQuery } from "@/data/explorer/list";
import { explorerTrendsFn } from "@/data/explorer/trends";
import { previousRange } from "@/data/overview/range";
import { toSqlDate } from "@/data/sql/date-range";

export const PAGE_SIZE = 100;

type ListArgs = {
  by: RankBy;
  scope: Scope;
  sort: RankSort;
  search: string;
  limit: number;
};

// The artist scope does not apply to the artist list itself.
const scoped = (by: RankBy, scope: Scope): Scope =>
  by === "artist" ? { ...scope, artistId: undefined } : scope;

const keyOf = ({ by, scope, sort, search }: ExplorerQuery) => ({
  by,
  sort,
  search,
  artistId: scoped(by, scope).artistId,
  from: toSqlDate(scope.from),
  to: toSqlDate(scope.to),
});

export const toQuery = ({ by, scope, sort, search }: ExplorerQuery): ExplorerQuery => ({
  by,
  scope: scoped(by, scope),
  sort,
  search,
});

export const explorerQueries = {
  list: {
    queryOptions: ({ limit, ...args }: ListArgs) => {
      const query = toQuery(args);

      return queryOptions({
        queryKey: ["explorer", "list", keyOf(query), limit],
        queryFn: () =>
          explorerListFn({
            ...query,
            previous: previousRange({ from: query.scope.from, to: query.scope.to }),
            limit,
          }),
        placeholderData: keepPreviousData,
      });
    },
  },
  trends: {
    queryOptions: ({ by, ids, scope }: { by: RankBy; ids: number[]; scope: Scope }) =>
      queryOptions({
        queryKey: ["explorer", "trends", by, ids, toSqlDate(scope.from), toSqlDate(scope.to)],
        queryFn: () => explorerTrendsFn({ by, ids, from: scope.from, to: scope.to }),
        enabled: ids.length > 0,
        placeholderData: keepPreviousData,
      }),
  },
};
