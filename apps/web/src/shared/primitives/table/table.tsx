import type { ComponentProps } from "react";

import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@harmony/ui/components/table";
import { cn } from "@harmony/ui/lib/utils";

type TableProps = ComponentProps<"table"> & {
  // framed: inside a rounded border, for short lists in a page.
  variant?: "flush" | "framed";
};

// The container stays visible so the head can stick to the scrolling pane.
const Root = ({ variant = "flush", className, ...props }: TableProps) => (
  <div
    data-slot="table-root"
    data-variant={variant}
    className={cn(
      "**:data-[slot=table-container]:overflow-visible",
      variant === "framed" && "overflow-hidden rounded-lg border border-border",
    )}
  >
    <UiTable className={className} {...props} />
  </div>
);

const Head = ({ className, ...props }: ComponentProps<typeof TableHeader>) => (
  <TableHeader
    data-slot="table-head"
    className={cn("sticky top-0 z-10 bg-background", className)}
    {...props}
  />
);

const Col = ({ className, ...props }: ComponentProps<typeof TableHead>) => (
  <TableHead
    data-slot="table-col"
    className={cn("h-7 bg-muted/50 text-xs font-medium text-muted-foreground", className)}
    {...props}
  />
);

type RowProps = Omit<ComponentProps<typeof TableRow>, "onSelect"> & {
  selected?: boolean;
  onSelect?: () => void;
};

const Row = ({ selected, onSelect, className, ...props }: RowProps) => (
  <TableRow
    data-slot="table-row"
    data-state={selected ? "selected" : undefined}
    className={cn(onSelect && "cursor-pointer", className)}
    onClick={onSelect}
    {...props}
  />
);

const Cell = ({ className, ...props }: ComponentProps<typeof TableCell>) => (
  <TableCell data-slot="table-cell" className={cn("py-1.5", className)} {...props} />
);

export const Table = Object.assign(Root, { Head, Col, Body: TableBody, Row, Cell });
