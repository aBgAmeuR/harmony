import type { QueryClient } from "@tanstack/react-query";

import type { DateRangeMode } from "@/shared/scope";

import { series, totals } from "@/data/aggregate";
import { albumTracksFn, itemFn, itemRule, type ItemRef } from "@/data/items";
import { query } from "@/shared/lib/query";
import { readScope, useDateRangeStore } from "@/shared/scope";

const STATS = ["playtime", "streams", "tracks", "skipRate"] as const;

export const itemQueries = {
  info: query("item", itemFn),
  stats: query("item-stats", (filter: Parameters<typeof totals>[0]) => totals(filter, STATS)),
  monthly: query("item-monthly", (filter: Parameters<typeof series>[0]) =>
    series(filter, ["playtime"], "month"),
  ),
  albumTracks: query("album-tracks", albumTracksFn),
};

// The monthly chart spans the year around the period (or the custom range itself), so a single
// month still shows where it sits.
export const monthlySpan = (mode: DateRangeMode, from: Date, to: Date) =>
  mode === "custom"
    ? { from, to }
    : { from: new Date(from.getFullYear(), 0, 1), to: new Date(from.getFullYear(), 11, 31) };

// Starts what the top of an item page shows, without blocking the navigation.
export const loadItem = (queryClient: QueryClient, item: ItemRef) => {
  const { from, to } = readScope();
  const rules = [itemRule(item)];
  const span = monthlySpan(useDateRangeStore.getState().mode, from, to);
  void queryClient.prefetchQuery(itemQueries.info(item));
  void queryClient.prefetchQuery(itemQueries.stats({ from, to, rules }));
  void queryClient.prefetchQuery(itemQueries.monthly({ ...span, rules }));
};
