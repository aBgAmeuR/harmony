import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

type DevicesWidgetProps = {
  trackId: number;
};

export const DevicesWidget = ({ trackId }: DevicesWidgetProps) => {
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.tracks.devices.queryOptions({ trackId, from, to }));

  const devices = data?.devices ?? [];

  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-xs font-normal text-muted-foreground">Devices</p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {devices.length > 0 ? (
          devices.map((device, index) => (
            <div
              key={device.label}
              className={`flex items-center justify-between gap-3 px-2.5 py-1.5 ${
                index < devices.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="truncate text-xs">{device.label}</span>
              <span className="text-xs font-medium tabular-nums">{device.percentage}%</span>
            </div>
          ))
        ) : (
          <div className="px-2.5 py-1.5">
            <span className="text-xs text-muted-foreground">No device data</span>
          </div>
        )}
      </div>
    </section>
  );
};
