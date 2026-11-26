import { atReleaseFn, discoveriesFn, discoverySummaryFn, returnsFn } from "@/data/discoveries";
import { query } from "@/shared/lib/query";

export const discoveryQueries = {
  summary: query("discoveries-summary", discoverySummaryFn),
  found: query("discoveries-found", discoveriesFn),
  returns: query("discoveries-returns", returnsFn),
  atRelease: query("discoveries-at-release", atReleaseFn),
};
