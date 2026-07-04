import { query } from "@/lib/query";

import { MetricCard } from "../components/metric-card";

export function ActiveDaysWidget() {
  return <MetricCard label="Active Listening Days" query={query.listeningHabits.activeDays} />;
}
