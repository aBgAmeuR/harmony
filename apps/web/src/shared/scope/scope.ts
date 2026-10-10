import type { Scope } from "./types";

import { useArtistStore } from "./artist";
import { buildInstantRangeQuery, useDateRangeStore, usePeriod } from "./period";

export const readScope = (): Scope => {
  const artistId = useArtistStore.getState().artist?.id;
  const { from, to } = buildInstantRangeQuery(useDateRangeStore.getState());
  return { artistId, from, to };
};

export const useScope = (): Scope => {
  const artistId = useArtistStore((s) => s.artist?.id);
  const { from, to } = usePeriod();
  return { artistId, from, to };
};
