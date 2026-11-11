import { useEffect, useRef, useState } from "react";

import type { ListRow, Trends } from "@/data/bases";

import { Media } from "@/shared/primitives/media";
import { Rank } from "@/shared/primitives/rank";
import { Table } from "@/shared/primitives/table";

import type { View } from "./view";

import { isNumeric, Value } from "./value";

// Drawn once its row scrolls into view: drawing every row at once blocks the first paint.
const Trend = ({ data }: { data: number[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);

  return (
    <div ref={ref} className="h-4.5">
      {seen ? <Bars data={data} /> : null}
    </div>
  );
};

const Bars = ({ data }: { data: number[] }) => {
  const max = Math.max(...data) || 1;
  const step = 100 / data.length;
  return (
    <svg viewBox="0 0 100 18" preserveAspectRatio="none" className="size-full" aria-hidden>
      {data.map((value, index) => {
        const height = Math.max(1.5, (value / max) * 18);
        return (
          <rect
            key={index}
            x={index * step + step * 0.15}
            y={18 - height}
            width={step * 0.7}
            height={height}
            rx={0.6}
            className={index === data.length - 1 ? "fill-chart-1" : "fill-chart-4"}
          />
        );
      })}
    </svg>
  );
};

const Move = ({ row }: { row: ListRow }) => {
  if (row.prevRank === null) return <span className="text-muted-foreground">new</span>;
  const places = row.prevRank - row.rank;
  if (places === 0) return <span className="text-muted-foreground">=</span>;
  return (
    <span className={places > 0 ? "text-chart-1" : "text-destructive"}>
      {places > 0 ? "↑" : "↓"}
      {Math.abs(places)}
    </span>
  );
};

// A bar behind each row for the sorted value, or the first numeric one when the sort is on text.
const useShare = (view: View, rows: ListRow[]) => {
  const { props } = view.base;
  const name = [view.sort, ...Object.keys(props)].find((key) => {
    const prop = props[key];
    return prop ? isNumeric(prop) : false;
  });
  const max = name ? Math.max(0, ...rows.map((row) => Number(row[name]) || 0)) : 0;
  return (row: ListRow) => {
    if (!view.bars || !name || max === 0) return undefined;
    const share = Math.round(((Number(row[name]) || 0) / max) * 1000) / 10;
    return {
      backgroundImage: `linear-gradient(to right, color-mix(in oklab, var(--primary) 9%, transparent) ${share}%, transparent ${share}%)`,
    };
  };
};

type BaseTableProps = {
  view: View;
  rows: ListRow[];
  trends: Trends | undefined;
  active: number;
  selected: (row: ListRow) => boolean;
  onOpen: (row: ListRow) => void;
};

const MAIN = "playtime";

export const BaseTable = ({ view, rows, trends, active, selected, onOpen }: BaseTableProps) => {
  const { base } = view;
  const pictured = base.views.includes("gallery");
  const trendKey = view.sort === "streams" ? "streams" : "playtime";
  const sorted = base.props[view.sort];
  const ranked = view.desc && sorted !== undefined && isNumeric(sorted);
  const share = useShare(view, rows);
  const below = sorted && view.sort !== MAIN ? view.sort : "streams";
  const main = base.props[MAIN];
  const sub = base.props[below];
  return (
    <Table>
      <Table.Body>
        {rows.map((row, index) => {
          const points = trends?.points[String(row.id)];
          return (
            <Table.Row
              key={row.id}
              data-index={index}
              selected={index === active || selected(row)}
              onSelect={() => onOpen(row)}
              className="border-0"
              style={share(row)}
            >
              <Table.Cell className="w-10 pl-4">
                <div className="flex flex-col items-center gap-0.5 text-micro leading-none font-medium tabular-nums">
                  <Rank n={row.rank} variant={ranked ? "medal" : "plain"} />
                  {view.diffs ? <Move row={row} /> : null}
                </div>
              </Table.Cell>
              <Table.Cell className="max-w-0">
                <Media>
                  {pictured ? <Media.Art src={row.image} alt={row.name} /> : null}
                  <Media.Body>
                    <Media.Title>{row.name}</Media.Title>
                    {row.description ? <Media.Sub>{row.description}</Media.Sub> : null}
                  </Media.Body>
                </Media>
              </Table.Cell>
              <Table.Cell className="w-24">
                {points && points.length > 0 ? (
                  <Trend data={points.map((point) => point[trendKey])} />
                ) : null}
              </Table.Cell>
              <Table.Cell className="w-28 pr-4">
                <div className="flex flex-col items-end gap-0.5">
                  {main ? (
                    <span className="text-foreground">
                      <Value row={row} name={MAIN} prop={main} size="sm+" />
                    </span>
                  ) : null}
                  {sub ? (
                    <span className="inline-flex items-baseline gap-1 text-[11px] whitespace-nowrap text-muted-foreground">
                      <Value row={row} name={below} prop={sub} size="2xs" />
                      {isNumeric(sub) ? sub.label.toLowerCase() : null}
                    </span>
                  ) : null}
                </div>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};
