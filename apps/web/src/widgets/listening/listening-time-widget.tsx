import { listeningQueries } from "./api";
import { MetricCard } from "./ui/metric-card";

export const ListeningTimeWidget = () => {
  return <MetricCard label="Listening Time" query={listeningQueries.listeningTime} unit="h" />;
};
