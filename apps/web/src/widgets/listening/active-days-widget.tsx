import { listeningQueries } from "./api";
import { MetricCard } from "./ui/metric-card";

export const ActiveDaysWidget = () => {
  return <MetricCard label="Active Listening Days" query={listeningQueries.activeDays} />;
};
