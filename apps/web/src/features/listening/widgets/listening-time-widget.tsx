import { query } from "@/lib/query";

import { MetricCard } from "../components/metric-card";

export function ListeningTimeWidget() {
  return (
    <MetricCard
      label="Listening Time"
      query={query.listeningHabits.listeningTime}
      unit="h"
    />
  );
}
