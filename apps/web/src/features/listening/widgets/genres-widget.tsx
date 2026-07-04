import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";

import { GenreSegmentedBar } from "../components/genre-segmented-bar";

export function GenresWidget() {
  const { data: segments = [] } = useQuery(query.listeningHabits.genres.queryOptions());

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Genres</span>
      </div>
      <div className="px-4 pt-4">
        <GenreSegmentedBar segments={segments} />
      </div>
    </div>
  );
}
