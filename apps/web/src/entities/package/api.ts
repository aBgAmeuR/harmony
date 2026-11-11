import { metaFn } from "@/data/packages/meta";
import { periodFn } from "@/data/packages/period";
import { query } from "@/shared/lib/query";

// Keys do not name the package: the app layout clears the cache when another one opens.
export const packageQueries = {
  meta: query("package-meta", metaFn),
  period: query("package-period", periodFn),
};
