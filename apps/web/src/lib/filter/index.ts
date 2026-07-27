import { useArtistStore } from "@/lib/stores/artist-store";
import {
  buildInstantRangeQuery,
  useDateRangeStore,
  useInstantRangeQuery,
} from "@/lib/stores/date-range-store";

export type Filter = {
  artistId?: number;
  from: Date;
  to: Date;
};

export function readFilter(): Filter {
  const artistId = useArtistStore.getState().artist?.id;
  const { from, to } = buildInstantRangeQuery(useDateRangeStore.getState());
  return { artistId, from, to };
}

export function useFilter(): Filter {
  const artistId = useArtistStore((s) => s.artist?.id);
  const { from, to } = useInstantRangeQuery();
  return { artistId, from, to };
}
