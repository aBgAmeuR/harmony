import type { Filter } from "@/data/filter";
import type { DateRangeMode } from "@/shared/scope";

import { aggregate, series, totals } from "@/data/aggregate";
import { listFn, rankFn, rankTrendFn, type ExplorerBaseId } from "@/data/bases";
import {
  behaviorFn,
  discoveredFn,
  erasFn,
  firstPlayFn,
  habitsFn,
  inOrderFn,
  platformsFn,
  playsFn,
} from "@/data/details";
import { albumTracksFn, itemFn } from "@/data/items";
import { streakFn } from "@/data/streak";
import { query } from "@/shared/lib/query";

const STATS = [
  "playtime",
  "streams",
  "days",
  "tracks",
  "albums",
  "artists",
  "skipRate",
  "completion",
  "finishedRate",
  "shuffleRate",
  "offlineRate",
  "firstPlayed",
  "lastPlayed",
] as const;

const TOP = 5;

export const detailQueries = {
  info: query("item", itemFn),
  stats: query("detail-stats", (filter: Filter) => totals(filter, STATS)),
  rank: query("detail-rank", rankFn),
  rankTrend: query("detail-rank-trend", rankTrendFn),
  days: query("detail-days", (filter: Filter) =>
    aggregate<"playtime", string>({ by: "day", measures: ["playtime"], filter, fill: true }),
  ),
  inOrder: query("detail-in-order", inOrderFn),
  streak: query("detail-streak", streakFn),
  monthly: query("detail-monthly", (filter: Parameters<typeof series>[0]) =>
    series(filter, ["playtime"], "month"),
  ),
  habits: query("detail-habits", habitsFn),
  behavior: query("detail-behavior", behaviorFn),
  platforms: query("detail-platforms", platformsFn),
  top: query(
    "detail-top",
    ({ base, filter, limit = TOP + 1 }: { base: ExplorerBaseId; filter: Filter; limit?: number }) =>
      listFn({ base, filter, sort: "playtime", desc: true, limit }),
  ),
  eras: query("detail-eras", erasFn),
  discovered: query("detail-discovered", discoveredFn),
  firstPlay: query("detail-first-play", firstPlayFn),
  plays: query("detail-plays", playsFn),
  albumTracks: query("album-tracks", albumTracksFn),
};

export const monthlySpan = (mode: DateRangeMode, from: Date, to: Date) =>
  mode === "custom"
    ? { from, to }
    : { from: new Date(from.getFullYear(), 0, 1), to: new Date(from.getFullYear(), 11, 31) };
