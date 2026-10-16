import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

export const rankTone = (n: number) => {
  switch (n) {
    case 1:
      return "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40";
    case 2:
      return "bg-slate-400/20 text-slate-200 ring-1 ring-slate-300/35";
    case 3:
      return "bg-orange-700/25 text-orange-200 ring-1 ring-orange-400/35";
    default:
      return "text-muted-foreground";
  }
};

type RankProps = ComponentProps<"span"> & {
  n: number;
};

export const Rank = ({ n, className, children, ...props }: RankProps) => (
  <span
    data-slot="rank"
    className={cn(
      "inline-flex h-5 min-w-5 items-center justify-center rounded-md text-xs font-medium",
      rankTone(n),
      className,
    )}
    {...props}
  >
    {children ?? n}
  </span>
);
