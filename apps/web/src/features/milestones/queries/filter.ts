import {
  buildListeningFilter,
  type ListeningRangeParams,
} from "@/features/listening/queries/listening-filter";

export function tracksJoin(params: ListeningRangeParams): string {
  const { artistJoin } = buildListeningFilter(params);
  return artistJoin || "JOIN tracks t ON t.id = i.track_id";
}

export function sqlRungValues(rungs: readonly number[]): string {
  return rungs.map((n) => `(${n})`).join(", ");
}

export { buildListeningFilter };
export type { ListeningRangeParams };
