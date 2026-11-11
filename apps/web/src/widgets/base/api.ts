import { listFn, trendsFn, type List, type Trends } from "@/data/bases";
import { valuesFn } from "@/data/values";
import { query } from "@/shared/lib/query";

const list = query("base-list", listFn);
const trends = query("base-trends", trendsFn);

export const baseQueries = {
  list: (args: Parameters<typeof listFn>[0]) => ({
    ...list(args),
    // Another base has other columns and opens other things: show nothing until it loads.
    placeholderData: (previous: List | undefined) =>
      previous?.base === args.base ? previous : undefined,
  }),
  trends: (args: Parameters<typeof trendsFn>[0]) => ({
    ...trends(args),
    enabled: args.ids.length > 0,
    placeholderData: (previous: Trends | undefined) =>
      previous?.base === args.base ? previous : undefined,
  }),
  values: query("field-values", valuesFn),
};
