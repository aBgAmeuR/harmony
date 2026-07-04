import { Gauge } from "@harmony/charts";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";

const GAUGE_SIZE = 132;

export function ListeningStyleWidget() {
  const { data = [] } = useQuery(query.listeningHabits.listeningStyle.queryOptions());

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Listening Style</span>
      </div>
      <div className="grid grid-cols-2 gap-2 px-2">
        {data.map((metric) => (
          <div className="flex justify-center" key={metric.label}>
            <Gauge
              centerValue={metric.value}
              defaultLabel={metric.label}
              height={GAUGE_SIZE}
              suffix="%"
              useGradient
              value={metric.value}
              width={GAUGE_SIZE}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
