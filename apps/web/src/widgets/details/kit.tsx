import type { ReactElement, ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import type { Filter } from "@/data/filter";
import type { Detail } from "@/features/detail-panel";

import { bases, type ExplorerBaseId, type ListRow } from "@/data/bases";
import { albumsRule, baseOf, itemRule, type Item } from "@/data/items";
import { measures } from "@/data/measures";
import { previousRange } from "@/shared/lib/date";
import { format } from "@/shared/lib/format";
import { Num } from "@/shared/primitives/num";
import { Section } from "@/shared/primitives/section";
import { Table } from "@/shared/primitives/table";
import { usePeriod } from "@/shared/scope";
import { useOpen } from "@/widgets/base/open";

import { detailQueries } from "./api";

export type PartProps = {
  item: Detail;
  info: Item;
  filter: Filter;
};

type CardProps = {
  title: ReactNode;
  caption?: ReactNode;
  className?: string;
  children: ReactNode;
};

export const Card = ({ title, caption, className, children }: CardProps) => (
  <Section
    className={cn(
      "gap-2.5 rounded-lg border border-border bg-card px-3.5 pt-3 pb-3.5 text-xs tabular-nums [&_b]:font-semibold [&_b]:text-foreground",
      className,
    )}
  >
    <div className="flex items-baseline justify-between gap-3">
      <Section.Title className="text-xs whitespace-nowrap">{title}</Section.Title>
      {caption ? (
        <span className="truncate text-right text-[11px] text-muted-foreground">{caption}</span>
      ) : null}
    </div>
    {children}
  </Section>
);

export const Foot = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap justify-between gap-x-2.5 border-t border-border pt-2.5">
    {children}
  </div>
);

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col">
    <span className="text-[11px] text-muted-foreground">{label}</span>
    <span className="truncate text-foreground">{children}</span>
  </div>
);

export const Tip = ({ text, render }: { text: ReactNode; render: ReactElement }) => (
  <Tooltip>
    <TooltipTrigger render={render} />
    <TooltipContent>
      <p>{text}</p>
    </TooltipContent>
  </Tooltip>
);

type StripProps = {
  values: number[];
  label: string;
  tip: (index: number) => ReactNode;
  tone?: (index: number) => string;
  className?: string;
};

export const Strip = ({ values, label, tip, tone, className }: StripProps) => {
  const max = Math.max(Number.EPSILON, ...values);
  return (
    <div role="img" aria-label={label} className={cn("flex h-6 items-end gap-0.5", className)}>
      {values.map((value, index) => (
        <Tip
          key={index}
          text={tip(index)}
          render={
            <span
              className={cn(
                "min-h-0.5 flex-1 rounded-xs",
                tone?.(index) ??
                  (value > 0 ? (value === max ? "bg-chart-1" : "bg-chart-3") : "bg-muted"),
              )}
              style={{ height: `${(value / max) * 100}%` }}
            />
          }
        />
      ))}
    </div>
  );
};

type UnitsProps = {
  label: string;
  parts: { share: number; label: string; className: string }[];
};

export const Units = ({ label, parts }: UnitsProps) => {
  const counts = parts.map((part) => Math.round(part.share * 100));
  const cells = counts.flatMap((count, index) => Array.from({ length: count }, () => parts[index]));
  return (
    <>
      <div role="img" aria-label={label} className="grid grid-cols-25 gap-0.5">
        {Array.from({ length: 100 }, (_, index) => (
          <Tip
            key={index}
            text={
              cells[index]
                ? `${cells[index].label} · ${format.as(cells[index].share, "percent")}`
                : "-"
            }
            render={
              <span className={cn("aspect-square rounded-xs bg-muted", cells[index]?.className)} />
            }
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[11px]">
        {parts.map((part) => (
          <span key={part.label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-xs", part.className)} />
            {part.label} <b>{format.as(part.share, "percent")}</b>
          </span>
        ))}
      </div>
    </>
  );
};

type ShareRowProps = {
  label: string;
  value: number;
  mark?: number;
  children: ReactNode;
};

export const ShareRow = ({ label, value, mark, children }: ShareRowProps) => (
  <div className="flex h-6.5 items-center gap-2.5">
    <span className="w-24 shrink-0">{label}</span>
    <div className="relative h-1.5 flex-1 rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-chart-1"
        style={{ width: `${Math.min(value, 1) * 100}%` }}
      />
      {mark === undefined ? null : (
        <span
          className="absolute -top-1 h-3.5 w-0.5 bg-foreground"
          style={{ left: `${Math.min(mark, 1) * 100}%` }}
        />
      )}
    </div>
    <span className="flex shrink-0 justify-end gap-2.5 text-right">{children}</span>
  </div>
);

type RankedProps = {
  title: string;
  caption?: ReactNode;
  base: ExplorerBaseId;
  rows: (Pick<ListRow, "id" | "name" | "description"> & { playtime?: ListRow["playtime"] })[];
};

export const Ranked = ({ title, caption, base, rows }: RankedProps) => {
  const open = useOpen();
  if (rows.length === 0) return null;

  return (
    <Card title={title} caption={caption}>
      <Table className="text-xs">
        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row key={row.id} onSelect={() => open(bases[base].opens, row)}>
              <Table.Cell className="w-5 pl-0 text-muted-foreground">{index + 1}</Table.Cell>
              <Table.Cell className="max-w-0 truncate">
                <span className="text-foreground">{row.name}</span>
                {row.description ? (
                  <span className="text-muted-foreground"> · {row.description}</span>
                ) : null}
              </Table.Cell>
              <Table.Cell className="w-20 pr-0 text-right">
                <Num value={Number(row.playtime)} kind="minutes" size="xs" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};

export const useTop = ({ item, filter }: PartProps, base: ExplorerBaseId, limit?: number) => {
  const rules = [base === "albums" ? albumsRule(item) : itemRule(item)];
  const { data } = useQuery(detailQueries.top({ base, filter: { ...filter, rules }, limit }));
  return (data?.rows ?? []).filter((row) => row.id !== item.id);
};

type TopProps = PartProps & { title: string; base: ExplorerBaseId; caption?: ReactNode };

export const Top = ({ title, base, caption, ...part }: TopProps) => (
  <Ranked title={title} caption={caption} base={base} rows={useTop(part, base).slice(0, 5)} />
);

const days = (count: number) => `${format.count(count)} ${count === 1 ? "day" : "days"}`;

export const useRank = (item: Detail) => {
  const period = usePeriod();
  const base = bases[baseOf[item.kind]];
  const { data } = useQuery(
    detailQueries.rank({
      base: base.id,
      id: item.id,
      filter: period,
      previous: previousRange(period),
    }),
  );
  return { base, rank: data };
};

export const KeyFacts = ({ filter }: { filter: Filter }) => {
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const { data: streak } = useQuery(detailQueries.streak(filter));
  const { data: habits } = useQuery(detailQueries.habits(filter));

  return (
    <>
      <Fact label={measures.firstPlayed.label}>{format.dateTime(stats?.firstPlayed)}</Fact>
      <Fact label={measures.lastPlayed.label}>{format.dateTime(stats?.lastPlayed)}</Fact>
      <Fact label="Longest streak">
        {streak ? `${days(streak.longestDays)} from ${format.date(streak.longestStart)}` : "-"}
      </Fact>
      <Fact label="Busiest day">
        {habits?.best
          ? `${format.date(habits.best.key)} · ${format.as(habits.best.playtime, "minutes")}`
          : "-"}
      </Fact>
    </>
  );
};

export const pts = (value: number) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(1)} pts`;
