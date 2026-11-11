import { topFn } from "@/data/bases";
import { highlightsFn, overviewFn } from "@/data/overview";
import { query } from "@/shared/lib/query";

export const TOP = 5;

export const overviewQueries = {
  kpis: query("overview", overviewFn),
  highlights: query("highlights", highlightsFn),
  top: query("top", topFn),
};
