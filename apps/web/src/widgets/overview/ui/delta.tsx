import type { ReactNode } from "react";

import { ArrowDownRight01Icon, ArrowUpRight01Icon, Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

type DeltaProps = {
  value: number | null;
  className?: string;
  // Pill with a tinted background instead of plain colored text.
  badge?: boolean;
  // Neutral gray whatever the sign, for deltas that are not in focus.
  muted?: boolean;
  children?: ReactNode;
};

export const Delta = ({ value, className, badge = false, muted = false, children }: DeltaProps) => {
  if (value === null) {
    return <span className={cn("text-muted-foreground tabular-nums", className)}>-</span>;
  }

  const pct = muted ? 0 : value * 100;
  const shown = value * 100;
  const sign = shown > 0 ? "+" : shown < 0 ? "-" : "";
  const label = `${sign}${Math.abs(shown).toFixed(Math.abs(shown) >= 100 ? 0 : 1)}%`;

  return (
    <span
      data-slot="delta"
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular-nums",
        badge && "rounded-md px-1.5 py-0.5",
        pct > 0 && cn("text-chart-1", badge && "bg-chart-1/10"),
        pct < 0 && cn("text-destructive", badge && "bg-destructive/10"),
        pct === 0 && cn("text-muted-foreground", badge && "bg-muted"),
        className,
      )}
    >
      {badge && !muted && pct !== 0 ? (
        <Icon icon={pct > 0 ? ArrowUpRight01Icon : ArrowDownRight01Icon} className="size-3.5" />
      ) : null}
      {label}
      {children ? <> {children}</> : null}
    </span>
  );
};
