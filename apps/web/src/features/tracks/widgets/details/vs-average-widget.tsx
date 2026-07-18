import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

type VsAverageWidgetProps = {
  trackId: number;
};

function formatMultiplier(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}x`;
}

export const VsAverageWidget = ({ trackId }: VsAverageWidgetProps) => {
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.tracks.vsAverage.queryOptions({ trackId, from, to }));

  const rows = data?.rows ?? [
    { label: "Streams", multiplier: 0 },
    { label: "Completion", multiplier: 0 },
    { label: "Replay rate", multiplier: 0 },
  ];

  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-xs font-normal text-muted-foreground">Vs. average</p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 ${
              index < rows.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="truncate text-xs text-muted-foreground">{row.label}</span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                row.multiplier >= 1 ? "text-primary" : "text-destructive",
              )}
            >
              {data ? formatMultiplier(row.multiplier) : "-"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
