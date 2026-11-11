import { topFn } from "@/data/bases";
import { query } from "@/shared/lib/query";

const top = query("artist-top", topFn);

export const artistQueries = {
  // The most listened artists of the period, matching `search` when there is one.
  top: ({ from, to, search }: { from: Date; to: Date; search?: string }) =>
    top({ base: "artists", filter: { from, to }, limit: 25, search: search || undefined }),
};
