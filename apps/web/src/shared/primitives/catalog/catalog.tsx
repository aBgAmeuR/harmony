import type { ComponentProps } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@harmony/ui/components/table";
import { cn } from "@harmony/ui/lib/utils";

import { Cover } from "@/shared/primitives/cover";

import { Rank } from "../rank";

const Root = ({ className, ...props }: ComponentProps<typeof Table>) => (
  <Table data-slot="catalog" className={cn("pb-2", className)} {...props} />
);

const Head = ({ className, ...props }: ComponentProps<typeof TableHeader>) => (
  <TableHeader data-slot="catalog-head" className={className} {...props} />
);

const Body = TableBody;

const Col = ({ className, ...props }: ComponentProps<typeof TableHead>) => (
  <TableHead
    data-slot="catalog-col"
    className={cn("h-7 bg-muted/50 text-xs font-medium text-muted-foreground", className)}
    {...props}
  />
);

type RowProps = ComponentProps<typeof TableRow> & {
  selected?: boolean;
};

const Row = ({ selected, onClick, className, ...props }: RowProps) => (
  <TableRow
    data-slot="catalog-row"
    data-state={selected ? "selected" : undefined}
    className={cn(onClick && "cursor-pointer", className)}
    onClick={onClick}
    {...props}
  />
);

const Cell = ({ className, ...props }: ComponentProps<typeof TableCell>) => (
  <TableCell data-slot="catalog-cell" className={cn("py-1.5", className)} {...props} />
);

const Pos = ({ n, className, ...props }: ComponentProps<typeof TableCell> & { n: number }) => (
  <Cell className={cn("pl-4 text-center tabular-nums", className)} {...props}>
    <Rank n={n} />
  </Cell>
);

type ItemProps = ComponentProps<typeof TableCell> & {
  name: string;
  image?: string | null;
  description?: string | null;
};

const Item = ({ name, image, description, className, ...props }: ItemProps) => (
  <Cell className={cn("max-w-0", className)} {...props}>
    <div className="flex min-w-0 items-center gap-3">
      <Cover src={image} alt={name} />
      <div className="flex min-h-9 min-w-0 flex-col justify-center">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </Cell>
);

export const Catalog = Object.assign(Root, { Head, Body, Col, Row, Cell, Pos, Item });
