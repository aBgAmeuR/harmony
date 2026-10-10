import { listeningQueries } from "./api";
import { MetricCard } from "./ui/metric-card";

export const TotalStreamsWidget = () => {
  return <MetricCard label="Total Streams" query={listeningQueries.totalStreams} />;
};
