const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatMetricValue(value?: number) {
  return value != null ? formatter.format(value) : "-";
}

export function MetricCell({ value, unit }: { value?: number; unit?: string }) {
  return (
    <span className="flex items-baseline justify-end gap-0.5">
      <span className="text-sm font-medium">{formatMetricValue(value)}</span>
      {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
    </span>
  );
}
