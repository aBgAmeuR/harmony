import { query } from "@/lib/query";

import { MetricCard } from "../components/metric-card";

export function UniqueTracksWidget() {
  return <MetricCard label="Unique Tracks" query={query.listeningHabits.uniqueTracks} />;
}
