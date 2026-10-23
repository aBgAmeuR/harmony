import { listeningQueries } from "./api";
import { MetricCard } from "./ui/metric-card";

export const UniqueTracksWidget = () => {
  return <MetricCard label="Unique Tracks" query={listeningQueries.uniqueTracks} />;
};
