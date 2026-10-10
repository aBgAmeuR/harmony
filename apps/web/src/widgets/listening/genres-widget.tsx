import { useQuery } from "@tanstack/react-query";

import { listeningQueries } from "./api";
import { GenreSegmentedBar } from "./ui/genre-segmented-bar";

export const GenresWidget = () => {
  const { data: segments = [] } = useQuery(listeningQueries.genres.queryOptions());

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
};
