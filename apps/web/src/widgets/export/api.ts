import { infiniteQueryOptions } from "@tanstack/react-query";

import { exportCountFn, exportRowsFn, type ExportQuery } from "@/data/export";
import { isoDay } from "@/shared/lib/date";
import { query } from "@/shared/lib/query";

export const PAGE = 200;

export const exportQueries = {
  rows: (args: ExportQuery) =>
    infiniteQueryOptions({
      queryKey: [
        "export-rows",
        { ...args, from: args.from && isoDay(args.from), to: args.to && isoDay(args.to) },
      ],
      queryFn: ({ pageParam }) => exportRowsFn({ ...args, offset: pageParam, limit: PAGE }),
      initialPageParam: 0,
      getNextPageParam: (last, pages) => (last.length < PAGE ? undefined : pages.length * PAGE),
    }),
  count: query("export-count", exportCountFn),
};
