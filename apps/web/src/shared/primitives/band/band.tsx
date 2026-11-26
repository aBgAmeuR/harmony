import type { ReactNode } from "react";

type BandProps = {
  id?: string;
  title: ReactNode;
  count?: ReactNode;
  children?: ReactNode;
};

export const Band = ({ id, title, count, children }: BandProps) => (
  <div className="flex h-7 shrink-0 items-center gap-2 bg-muted/50 px-3 text-xs">
    <h2 id={id} className="font-semibold text-foreground">
      {title}
    </h2>
    {count === undefined ? null : (
      <span className="text-muted-foreground tabular-nums">{count}</span>
    )}
    {children}
  </div>
);
