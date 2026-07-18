import { Icon, Loading03Icon, ViewIcon, ViewOffSlashIcon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Card, CardContent } from "@harmony/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@harmony/ui/components/table";
import { cn } from "@harmony/ui/lib/utils";
import { useState } from "react";

import type { Catalog } from "./catalog";
import type { CatalogTrendPoint } from "./catalog-trend-sparkline";

import { MetricCell } from "../format/metric-cell";
import { CatalogImage } from "./catalog-image";
import { CatalogTrendSparkline } from "./catalog-trend-sparkline";

const getRankClassName = (rank: number) => {
  switch (rank) {
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

type CatalogTableProps = {
  catalog: Array<Catalog> | undefined;
  empty?: string;
  loading?: boolean;
  selectedId?: number;
  onSelectItem?: (item: Catalog) => void;
  stickyHeader?: boolean;
  trends?: Record<number, CatalogTrendPoint[]>;
};

export const CatalogTable = ({
  catalog,
  empty = "No items yet.",
  loading = false,
  selectedId,
  onSelectItem,
  stickyHeader = false,
  trends,
}: CatalogTableProps) => {
  const [showSparklines, setShowSparklines] = useState(true);
  const showTrendColumn = trends !== undefined;
  const columnCount = showTrendColumn ? 5 : 4;

  if (!loading && (!catalog || catalog.length <= 0)) {
    return (
      <Card size="sm">
        <CardContent className="text-sm text-muted-foreground">{empty}</CardContent>
      </Card>
    );
  }

  const headClassName = cn("h-7 bg-muted/50 text-xs font-medium text-muted-foreground");

  return (
    <div className={cn(stickyHeader && "[&_[data-slot=table-container]]:overflow-visible")}>
      <Table className="pb-2">
        <TableHeader className={cn(stickyHeader ? "bg-background!" : "bg-muted/50")}>
          <TableRow className={cn("bg-background!", stickyHeader && "sticky top-0 z-10")}>
            <TableHead className={cn(headClassName, "w-[35.5px] pl-4 text-center")}>#</TableHead>
            <TableHead className={cn(headClassName, "text-left")}>Title</TableHead>
            {showTrendColumn && (
              <TableHead className={cn(headClassName, "w-32")}>
                <div className="flex items-center">
                  <span>Trend</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowSparklines((current) => !current)}
                  >
                    <Icon icon={showSparklines ? ViewIcon : ViewOffSlashIcon} />
                  </Button>
                </div>
              </TableHead>
            )}
            <TableHead className={cn(headClassName, "w-16 text-right tabular-nums")}>
              Streams
            </TableHead>
            <TableHead className={cn(headClassName, "w-28 pr-4 text-right tabular-nums")}>
              Time Listened
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="h-32 text-center align-middle text-sm text-muted-foreground"
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon icon={Loading03Icon} className="size-4 animate-spin" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            catalog?.map((item, index) => {
              const selected = selectedId === item.id;
              const trend = trends?.[item.id];

              return (
                <TableRow
                  key={item.id}
                  data-state={selected ? "selected" : undefined}
                  className={cn(onSelectItem && "cursor-pointer")}
                  onClick={onSelectItem ? () => onSelectItem(item) : undefined}
                >
                  <TableCell className="py-1.5 pl-4 text-center tabular-nums">
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md text-xs font-medium ${getRankClassName(index + 1)}`}
                    >
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-0 py-1.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <CatalogImage image={item.image} alt={item.name} />
                      <div className="flex min-h-9 min-w-0 flex-col justify-center">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  {showTrendColumn ? (
                    <TableCell className="py-1.5">
                      {showSparklines && trend && trend.length > 0 ? (
                        <CatalogTrendSparkline trend={trend} />
                      ) : null}
                    </TableCell>
                  ) : null}
                  <TableCell className="py-1.5 text-right">
                    <MetricCell value={item.streams} />
                  </TableCell>
                  <TableCell className="py-1.5 pr-4">
                    <MetricCell value={item.playtime} unit="min" />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
