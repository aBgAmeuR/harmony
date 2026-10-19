import { ArrowDown01Icon, Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

import type { ExplorerRow } from "@/data/explorer/list";
import type { ExplorerTrends } from "@/data/explorer/trends";

import { measure } from "@/shared/lib/measure";
import { Delta } from "@/shared/primitives/delta";
import { Media } from "@/shared/primitives/media";
import { Meter } from "@/shared/primitives/meter";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Table } from "@/shared/primitives/table";

import type { ExplorerSort } from "./search";

import { ExplorerTrend, type TrendUnit } from "./trend";

type SortHeadProps = {
  sort: ExplorerSort;
  value: ExplorerSort;
  onSort: (sort: ExplorerSort) => void;
  className?: string;
};

// A measure is picked by clicking its column header: the active one is green, with a caret.
export const SortHead = ({ sort, value, onSort, className }: SortHeadProps) => {
  const active = sort === value;

  return (
    <Table.Col
      className={cn("text-right tabular-nums", className)}
      aria-sort={active ? "descending" : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(value)}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
          active && "text-primary hover:text-primary",
        )}
      >
        {measure[value].label}
        {active ? <Icon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" /> : null}
      </button>
    </Table.Col>
  );
};

type MeasureProps = {
  row: ExplorerRow;
  sort: ExplorerSort;
  value: ExplorerSort;
  // Largest value of the column among the rows shown, the bar is relative to it.
  max: number;
};

const Measure = ({ row, sort, value, max }: MeasureProps) => (
  <div className="flex flex-col items-end gap-1">
    <Num value={row[value]} kind={measure[value].kind} />
    {sort === value ? <Meter value={row[value]} max={max} size="xs" /> : null}
  </div>
);

type ExplorerTableProps = {
  rows: ExplorerRow[];
  trends: ExplorerTrends | undefined;
  trendUnit: TrendUnit;
  sort: ExplorerSort;
  onSort: (sort: ExplorerSort) => void;
  active: number;
  selectedId?: number;
  onOpen: (row: ExplorerRow) => void;
};

export const ExplorerTable = ({
  rows,
  trends,
  trendUnit,
  sort,
  onSort,
  active,
  selectedId,
  onOpen,
}: ExplorerTableProps) => {
  const maxPlaytime = Math.max(0, ...rows.map((row) => row.playtime));
  const maxStreams = Math.max(0, ...rows.map((row) => row.streams));

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Col className="w-10 pl-4 text-center">#</Table.Col>
          <Table.Col className="text-left">Name</Table.Col>
          <Table.Col className="w-36">
            {trendUnit === "day" ? "Trend · daily" : "Trend · monthly"}
          </Table.Col>
          <Table.Col className="w-16 text-right">Change</Table.Col>
          <SortHead sort={sort} value="playtime" onSort={onSort} className="w-32" />
          <SortHead sort={sort} value="streams" onSort={onSort} className="w-24 pr-4" />
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((row, index) => {
          const points = trends?.[row.id];

          return (
            <Table.Row
              key={row.id}
              data-index={index}
              data-active={index === active ? "" : undefined}
              selected={index === active || row.id === selectedId}
              onSelect={() => onOpen(row)}
            >
              <Table.Cell className="pl-4 text-center">
                <Rank n={row.rank} />
              </Table.Cell>
              <Table.Cell className="max-w-0">
                <Media>
                  <Media.Art src={row.image} alt={row.name} />
                  <Media.Body>
                    <Media.Title>{row.name}</Media.Title>
                    <Media.Sub>{row.description}</Media.Sub>
                  </Media.Body>
                </Media>
              </Table.Cell>
              <Table.Cell>
                {points && points.length > 0 ? <ExplorerTrend points={points} sort={sort} /> : null}
              </Table.Cell>
              <Table.Cell className="text-right">
                <Delta
                  kind="places"
                  value={row.prevRank === null ? null : row.prevRank - row.rank}
                />
              </Table.Cell>
              <Table.Cell>
                <Measure row={row} sort={sort} value="playtime" max={maxPlaytime} />
              </Table.Cell>
              <Table.Cell className="pr-4">
                <Measure row={row} sort={sort} value="streams" max={maxStreams} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};
