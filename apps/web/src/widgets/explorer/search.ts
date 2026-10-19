import type { RankBy, RankSort } from "@/data/rank";

import { parseTrack } from "@/entities/track";

export const TABS = ["artists", "tracks", "albums"] as const;
export const SORTS = ["playtime", "streams"] as const;

export type ExplorerTab = (typeof TABS)[number];
export type ExplorerSort = RankSort;

// Everything the Explorer keeps in the URL. Period and artist live in their own stores.
export type ExplorerSearch = {
  tab?: ExplorerTab;
  sort?: ExplorerSort;
  q?: string;
  track?: number;
};

export const DEFAULT_TAB: ExplorerTab = "artists";
export const DEFAULT_SORT: ExplorerSort = "playtime";

export const BY: Record<ExplorerTab, RankBy> = {
  artists: "artist",
  tracks: "track",
  albums: "album",
};

const oneOf = <T extends string>(values: readonly T[], value: unknown): T | undefined =>
  values.find((candidate) => candidate === value);

export const parseExplorerSearch = (raw: Record<string, unknown>): ExplorerSearch => {
  const q = typeof raw.q === "string" && raw.q.trim() !== "" ? raw.q : undefined;

  return {
    tab: oneOf(TABS, raw.tab),
    sort: oneOf(SORTS, raw.sort),
    q,
    track: parseTrack(raw.track),
  };
};
