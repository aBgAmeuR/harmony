import { buildListeningFilter, type ListeningRangeParams } from "@/data/listening/listening-filter";

export const tracksJoin = (params: ListeningRangeParams): string => {
  const { artistJoin } = buildListeningFilter(params);
  return artistJoin || "JOIN tracks t ON t.id = i.track_id";
};

export const sqlRungValues = (rungs: readonly number[]): string => {
  return rungs.map((n) => `(${n})`).join(", ");
};

export { buildListeningFilter };
export type { ListeningRangeParams };
