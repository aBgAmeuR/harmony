import { defaultRadarColors, FunnelChart } from "@harmony/charts";
import { useQuery } from "@tanstack/react-query";

import { listeningQueries } from "./api";

export const TrackEngagementWidget = () => {
  const { data = [] } = useQuery(listeningQueries.trackEngagement.queryOptions());

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Track Engagement</span>
      </div>
      <div>
        <FunnelChart
          data={data.map((d, index) => ({
            ...d,
            color: defaultRadarColors[index % 5],
          }))}
          layers={5}
          className="aspect-[4/1]! size-full"
        />
      </div>
    </div>
  );
};
