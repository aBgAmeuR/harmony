import type { ExplorerRow } from "@/data/explorer/list";

// The demo package's top four artists of 2026, as `explorerListFn` returns them.
const artist = (
  id: number,
  name: string,
  playtime: number,
  streams: number,
  rank: number,
  prevRank: number,
): ExplorerRow => ({
  id,
  name,
  description: null,
  image: `/landing/covers/artist-${id}.webp`,
  playtime,
  streams,
  rank,
  prevRank,
});

export const TOP_ARTISTS: ExplorerRow[] = [
  artist(2568121, "Ken Carson", 5119, 1938, 1, 3),
  artist(10002824, "Playboi Carti", 4964, 1789, 2, 1),
  artist(121652122, "SLAYR", 4303, 1695, 3, 69),
  artist(7101343, "Lil Uzi Vert", 4084, 1309, 4, 6),
];
