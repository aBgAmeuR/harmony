import type { ReactNode } from "react";

import { cn } from "@harmony/ui/lib/utils";

import type { AtRelease, Find, Return } from "@/data/discoveries";

import { useDetail } from "@/features/detail-panel";
import { parseDay } from "@/shared/lib/date";
import { Bars } from "@/shared/primitives/bars";
import { Media } from "@/shared/primitives/media";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Table } from "@/shared/primitives/table";

const dayMonth = (value: string) => {
  const date = parseDay(value);
  return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })}`;
};

export const spanLabel = (start: string, last: string) => {
  if (start === last) return dayMonth(start);
  if (start.slice(0, 7) === last.slice(0, 7))
    return `${parseDay(start).getDate()} – ${dayMonth(last)}`;
  return `${dayMonth(start)} – ${dayMonth(last)}`;
};

export const weeksLabel = (weeks: number) => (weeks === 1 ? "1 week" : `${weeks} weeks`);

export const awayLabel = (days: number) => {
  if (days >= 730) return `away ${Math.floor(days / 365)} years`;
  return `away ${Math.round(days / 30.44)} months`;
};

export const backLabel = (row: Return) => `back ${dayMonth(row.start)}`;

export const ReleaseGap = ({ row }: { row: AtRelease }) =>
  row.days === 0 ? (
    <span className="inline-flex h-5 items-center rounded-full bg-primary/15 px-2 text-[11px] text-primary">
      Release day
    </span>
  ) : (
    <span>{row.days === 1 ? "1 day after" : `${row.days} days after`}</span>
  );

type FindRowProps = {
  find: Find;
  opens: "artist" | "album";
  rank?: number;
  sub?: string | null;
  when: ReactNode;
  note: string;
};

export const FindRow = ({ find, opens, rank, sub, when, note }: FindRowProps) => {
  const { open, current } = useDetail();
  const select = () => void open({ kind: opens, id: find.id });

  return (
    <Table.Row
      selected={current?.kind === opens && current.id === find.id}
      onSelect={select}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        select();
      }}
      className="border-0 outline-none focus-visible:bg-muted/50"
    >
      {rank === undefined ? null : (
        <Table.Cell className="w-10 pl-3">
          <div className="flex justify-center text-micro leading-none font-medium tabular-nums">
            <Rank n={rank} variant="plain" />
          </div>
        </Table.Cell>
      )}
      <Table.Cell className={cn("max-w-0", rank === undefined && "pl-3")}>
        <Media>
          <Media.Art src={find.image} alt={find.name} />
          <Media.Body>
            <Media.Title>{find.name}</Media.Title>
            {sub ? <Media.Sub>{sub}</Media.Sub> : null}
          </Media.Body>
        </Media>
      </Table.Cell>
      <Table.Cell className="w-28 text-xs text-muted-foreground tabular-nums">{when}</Table.Cell>
      <Table.Cell className="hidden w-24 @xl:table-cell">
        <Bars data={find.spark} />
      </Table.Cell>
      <Table.Cell className="w-28 pr-3">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-foreground">
            <Num value={find.minutes} kind="minutes" size="sm+" />
          </span>
          <span className="text-[11px] whitespace-nowrap text-muted-foreground">{note}</span>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

export const FindTable = ({ children }: { children: ReactNode }) => (
  <div className="@container">
    <Table>
      <Table.Body>{children}</Table.Body>
    </Table>
  </div>
);

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
