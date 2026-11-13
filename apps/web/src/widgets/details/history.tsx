import {
  barY,
  Chart,
  chartBase,
  colors,
  columnBand,
  columnTooltip,
  defineChart,
  intensity,
  xBand,
  yValue,
} from "@harmony/charts/v4";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { bases } from "@/data/bases";
import { baseOf } from "@/data/items";
import { measures } from "@/data/measures";
import { seriesOf } from "@/entities/measure";
import { useDetail } from "@/features/detail-panel";
import { isoDay, parseDay } from "@/shared/lib/date";
import { format } from "@/shared/lib/format";
import { periodLabel, showPeriod, useDateRangeStore, usePeriod } from "@/shared/scope";

import { detailQueries, monthlySpan } from "./api";
import { Card, Foot, KeyFacts, ShareRow, Tip, type PartProps } from "./kit";

const DIMMED = "color-mix(in srgb, var(--chart-1) 30%, transparent)";
const SERIES = seriesOf("playtime", colors.primary);
const short = new Intl.DateTimeFormat("en-US", { month: "short" });

const Timeline = ({ item, filter }: PartProps) => {
  const mode = useDateRangeStore((store) => store.mode);
  const { from, to } = usePeriod();
  const span = monthlySpan(mode, from, to);
  const base = bases[baseOf[item.kind]];
  const { data } = useQuery(detailQueries.monthly({ ...span, rules: filter.rules }));
  const { data: ranks = [] } = useQuery(
    detailQueries.rankTrend({ base: base.id, id: item.id, filter: span }),
  );
  const first = isoDay(new Date(from.getFullYear(), from.getMonth(), 1));
  const last = isoDay(to);

  const definition = useMemo(() => {
    const rows = (data?.points ?? []).map((month) => ({
      label: month.key,
      value: month.playtime,
      active: month.key >= first && month.key <= last,
    }));
    return defineChart({
      ...chartBase,
      marks: [
        barY(rows, {
          id: "months",
          x: "label",
          y: "value",
          z: () => "playtime",
          fill: (row) => (row.active ? colors.primary : DIMMED),
          radius: 2,
        }),
        columnBand(),
      ],
      scales: {
        x: xBand({ format: (label) => short.format(parseDay(label)) }),
        y: { ...yValue(), axis: false },
      },
      ...columnTooltip(SERIES),
    });
  }, [data, first, last]);

  return (
    <Card title="Timeline" caption={`${from.getFullYear()} · selected period in bright green`}>
      <span className="text-[10px] text-muted-foreground">Minutes</span>
      <Chart
        definition={definition}
        aspectRatio={5}
        ariaLabel="Minutes per month"
        onSelect={(point) => point && showPeriod("month", parseDay(point.datum.label))}
      />
      {ranks.length > 1 ? (
        <>
          <span className="text-[10px] text-muted-foreground">
            Rank among your {base.title.toLowerCase()}
          </span>
          <RankLine months={(data?.points ?? []).map((point) => point.key)} ranks={ranks} />
        </>
      ) : null}
    </Card>
  );
};

type RankLineProps = {
  months: string[];
  ranks: { label: string; rank: number }[];
};

const RankLine = ({ months, ranks }: RankLineProps) => {
  const byMonth = new Map(ranks.map((row) => [row.label.slice(0, 7), row.rank]));
  const worst = Math.max(2, ...ranks.map((row) => row.rank));
  const best = Math.min(...ranks.map((row) => row.rank));
  const points = months.flatMap((month, index) => {
    const rank = byMonth.get(month.slice(0, 7));
    return rank === undefined
      ? []
      : [
          {
            month,
            rank,
            x: ((index + 0.5) / months.length) * 100,
            y: (Math.log(rank) / Math.log(worst)) * 100,
          },
        ];
  });

  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-12">
        <span className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
        <svg className="absolute inset-0 size-full overflow-visible" aria-hidden>
          {points.slice(1).map((point, index) => (
            <line
              key={point.month}
              x1={`${points[index]?.x}%`}
              y1={`${points[index]?.y}%`}
              x2={`${point.x}%`}
              y2={`${point.y}%`}
              stroke="var(--chart-2)"
              strokeWidth={1.5}
            />
          ))}
        </svg>
        {points.map((point) => (
          <Tip
            key={point.month}
            text={`${format.month(point.month)} · #${format.count(point.rank)}`}
            render={
              <span
                className={cn(
                  "absolute -translate-1/2 rounded-full",
                  point.rank === best ? "size-2 bg-chart-1" : "size-1.5 bg-chart-3",
                )}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              />
            }
          />
        ))}
      </div>
      <div
        className="grid text-center text-[10px] text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${months.length}, 1fr)` }}
      >
        {months.map((month) => {
          const rank = byMonth.get(month.slice(0, 7));
          return (
            <span key={month} className={cn(rank === best && "font-semibold text-foreground")}>
              {rank === undefined ? "" : `#${format.count(rank)}`}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const Month = ({ filter }: PartProps) => {
  const mode = useDateRangeStore((store) => store.mode);
  const { from, to } = usePeriod();
  const { data: dayRows = [] } = useQuery(detailQueries.days(filter));
  const max = Math.max(0, ...dayRows.map((day) => day.playtime));
  const [first] = dayRows;
  const offset = first ? (parseDay(first.key).getDay() + 6) % 7 : 0;
  const calendar = mode === "month";

  return (
    <Card title={periodLabel(mode, from, to)} caption="time per day">
      <div className={cn("flex gap-5", !calendar && "flex-col")}>
        <div
          className={cn(
            "grid gap-0.5",
            calendar ? "w-52 shrink-0 grid-cols-7" : "auto-cols-fr grid-flow-col grid-rows-7",
          )}
        >
          {calendar
            ? WEEKDAYS.map((label, index) => (
                <span key={index} className="text-center text-[10px] text-muted-foreground">
                  {label}
                </span>
              ))
            : null}
          {offset > 0 ? (
            <span
              style={calendar ? { gridColumn: `span ${offset}` } : { gridRow: `span ${offset}` }}
            />
          ) : null}
          {dayRows.map((day) => (
            <span
              key={day.key}
              title={`${format.date(day.key)} · ${format.as(day.playtime, "minutes")}`}
              className={cn(
                "flex items-center justify-center rounded-xs text-[10px]",
                calendar ? "h-6 text-foreground" : "aspect-square",
                day.playtime === 0 && "text-muted-foreground",
              )}
              style={{ background: intensity(day.playtime, max) }}
            >
              {calendar ? parseDay(day.key).getDate() : null}
            </span>
          ))}
        </div>
        <div className={cn("grid min-w-0 flex-1 gap-1.5", !calendar && "grid-cols-2")}>
          <KeyFacts filter={filter} />
        </div>
      </div>
    </Card>
  );
};

const AllTime = ({ item, filter }: PartProps) => {
  const mode = useDateRangeStore((store) => store.mode);
  const { from, to } = usePeriod();
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const { data: ever } = useQuery(detailQueries.stats({ rules: filter.rules }));
  const { data: first } = useQuery(detailQueries.firstPlay(filter.rules));
  const { open } = useDetail();
  const rows = [
    { key: "playtime", kind: "minutes" },
    { key: "streams", kind: "count" },
    { key: "days", kind: "count" },
  ] as const;

  return (
    <Card title="All time" caption={`share taken by ${periodLabel(mode, from, to)}`}>
      <div>
        {rows.map(({ key, kind }) => (
          <ShareRow
            key={key}
            label={measures[key].label}
            value={stats && ever ? stats[key] / (ever[key] || 1) : 0}
          >
            <span className="w-30">
              <b>{stats ? format.as(stats[key], kind) : "-"}</b> of{" "}
              {ever ? format.as(ever[key], kind) : "-"}
            </span>
          </ShareRow>
        ))}
      </div>
      <Foot>
        <span>First played {format.date(ever?.firstPlayed)}</span>
        <span>Last played {format.date(ever?.lastPlayed)}</span>
        {first && item.kind !== "track" ? (
          <button
            type="button"
            onClick={() => open({ kind: "track", id: first.track })}
            className="cursor-pointer underline-offset-2 hover:underline"
          >
            First track: <b>{first.name}</b>
          </button>
        ) : null}
      </Foot>
    </Card>
  );
};

export const History = (part: PartProps) => (
  <>
    <Timeline {...part} />
    <Month {...part} />
    <AllTime {...part} />
  </>
);
