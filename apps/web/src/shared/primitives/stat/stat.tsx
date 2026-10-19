import type { ComponentProps, ReactNode } from "react";

import { cn } from "@harmony/ui/lib/utils";
import { createContext, useContext } from "react";

import type { Kind } from "@/utils/format";

import { Num, numSizes } from "../num";

type Layout = "tile" | "row";

const LayoutContext = createContext<Layout>("tile");

type StatProps = ComponentProps<"div"> & {
  // tile: label above the value. row: label on the left, value on the right.
  layout?: Layout;
};

const Root = ({ layout = "tile", className, ...props }: StatProps) => (
  <LayoutContext.Provider value={layout}>
    <div
      data-slot="stat"
      data-layout={layout}
      className={cn(
        "relative flex min-w-0",
        layout === "tile"
          ? "flex-col gap-1 px-3 py-2.5"
          : "items-center justify-between gap-3 px-2.5 py-1.5",
        className,
      )}
      {...props}
    />
  </LayoutContext.Provider>
);

const Label = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    data-slot="stat-label"
    className={cn("truncate text-xs text-muted-foreground", className)}
    {...props}
  />
);

type ValueProps = {
  value?: number | null;
  kind?: Kind;
  size?: keyof typeof numSizes;
  className?: string;
  // Free text instead of a number, such as a date.
  children?: ReactNode;
};

const Value = ({ value, kind, size, className, children }: ValueProps) => {
  const layout = useContext(LayoutContext);
  const resolved = size ?? (layout === "row" ? "xs" : "lg");

  if (children !== undefined) {
    return (
      <span
        data-slot="stat-value"
        className={cn("min-w-0 tabular-nums", numSizes[resolved].value, className)}
      >
        {children}
      </span>
    );
  }

  return <Num value={value} kind={kind} size={resolved} className={className} />;
};

const Hint = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    data-slot="stat-hint"
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
);

// Top right corner of a tile: an icon, a picture or a button.
const Aside = ({ className, ...props }: ComponentProps<"div">) => (
  <div data-slot="stat-aside" className={cn("absolute top-2.5 right-3", className)} {...props} />
);

export const Stat = Object.assign(Root, { Label, Value, Hint, Aside });
