import { Icon, NextIcon, ShuffleIcon, WifiOffIcon } from "@harmony/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@harmony/ui/components/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import { format } from "@/utils/format";

import type { Interaction } from "../types";

import { InteractionsPlatform } from "./interactions-platform";

const ROW_HEIGHT = 32;

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Interaction>();

const columns = columnHelper.columns([
  columnHelper.accessor("timestamp", {
    id: "date",
    header: "Date",
    cell: (info) => format.date(new Date(info.getValue())),
  }),
  columnHelper.accessor("msPlayed", {
    id: "time",
    header: "Time",
    cell: (info) => format.duration(info.getValue()),
  }),
  columnHelper.accessor("platform", {
    header: "Platform",
    cell: (info) => <InteractionsPlatform platform={info.getValue()} />,
  }),
  columnHelper.display({
    id: "context",
    header: "Context",
    cell: ({ row }) => <ContextCell interaction={row.original} />,
  }),
]);

const colClass: Record<string, string> = {
  date: "flex-[1.4] pl-4",
  time: "flex-1",
  platform: "flex-1",
  context: "flex-1 justify-end pr-4",
};

type InteractionsTableProps = {
  interactions: Interaction[];
  enabled?: boolean;
};

export const InteractionsTable = ({ interactions, enabled = true }: InteractionsTableProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const table = useTable({
    features,
    columns,
    data: interactions,
    getRowId: (row) => row.timestamp,
  });
  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => scrollRef.current,
    overscan: 8,
    enabled,
    useCachedMeasurements: !enabled,
  });

  return (
    <div ref={scrollRef} className="relative h-full overflow-auto">
      <div className="[&_[data-slot=table-container]]:overflow-visible">
        <Table className="grid w-full">
          <TableHeader className="sticky top-0 z-10 grid bg-background">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="flex w-full bg-background hover:bg-background">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "flex h-7 items-center text-xs font-medium text-muted-foreground",
                      colClass[header.column.id],
                    )}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative grid" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index]!;
              return (
                <TableRow
                  key={row.id}
                  className="absolute flex w-full"
                  style={{ height: ROW_HEIGHT, transform: `translateY(${item.start}px)` }}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("flex items-center", colClass[cell.column.id])}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

function ContextCell({ interaction }: { interaction: Interaction }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Flag
        show={interaction.offline}
        icon={WifiOffIcon}
        label="Offline"
        className="text-blue-400"
      />
      <Flag
        show={interaction.shuffle}
        icon={ShuffleIcon}
        label="Shuffled"
        className="text-primary"
      />
      <Flag show={interaction.skipped} icon={NextIcon} label="Skipped" className="text-red-400" />
    </div>
  );
}

function Flag({
  show,
  icon,
  label,
  className,
}: {
  show: boolean;
  icon: typeof WifiOffIcon;
  label: string;
  className: string;
}) {
  if (!show) return <div className="size-4" />;
  return (
    <Tooltip>
      <TooltipTrigger render={<Icon icon={icon} className={className} />} />
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
