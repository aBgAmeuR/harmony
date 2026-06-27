import { query } from "@/lib/query";

import { MetricCard } from "../components/metric-card";

export function TotalStreamsWidget() {
  return (
    <MetricCard
      label="Total Streams"
      query={query.listeningHabits.totalStreams}
    />
  );
}
