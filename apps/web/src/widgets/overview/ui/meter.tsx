import { cn } from "@harmony/ui/lib/utils";

type MeterProps = {
  label: string;
  // 0 to 100
  value: number;
  className?: string;
};

export const Meter = ({ label, value, className }: MeterProps) => (
  <div className={cn("flex h-6 items-center gap-3", className)}>
    <span className="w-16 shrink-0 truncate text-muted-foreground">{label}</span>
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-chart-1" style={{ width: `${value}%` }} />
    </div>
    <span className="w-9 text-right text-foreground tabular-nums">{value}%</span>
  </div>
);
