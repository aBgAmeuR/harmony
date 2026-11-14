import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { bases, type ListRow } from "@/data/bases";
import { format } from "@/shared/lib/format";
import { useOpen } from "@/widgets/base/open";

import { detailQueries } from "./api";
import {
  Card,
  Foot,
  Pending,
  Ranked,
  ShareRow,
  Strip,
  Tip,
  Top,
  useTop,
  type PartProps,
} from "./kit";

const SPREAD = 22;
const ROW = 32;
const ALBUMS = 7;
const TREE = 128;
const OTHERS_MIN = 56;
const OTHERS_MAX = 0.28;

const Eras = ({ filter }: PartProps) => {
  const { data: eras } = useQuery(detailQueries.eras(filter));
  if (!eras) return <Pending title="Release years" className="h-14" />;
  if (eras.length < 2) return null;
  const max = Math.max(...eras.map((era) => era.value));
  const x = (index: number) => `${((index + 0.5) / eras.length) * 100}%`;

  return (
    <Card title="Release years">
      <div role="img" aria-label="Listening by release year" className="relative h-14">
        <span className="absolute inset-x-0 top-5 border-t border-border" />
        {eras.map((era, index) => {
          const size = `${Math.max(Math.sqrt(era.value / max) * 32, 3)}px`;
          return era.value > 0 ? (
            <Tip
              key={era.label}
              text={`${era.label} · ${format.as(era.value, "minutes")}`}
              render={
                <span
                  className={cn(
                    "absolute top-5 -translate-1/2 rounded-full",
                    era.value === max ? "bg-chart-1" : "bg-chart-3/90",
                  )}
                  style={{ left: x(index), width: size, height: size }}
                />
              }
            />
          ) : null;
        })}
        {eras.map((era, index) =>
          Number(era.label) % 5 === 0 ? (
            <span
              key={era.label}
              className="absolute bottom-0 -translate-x-1/2 text-[10px] text-muted-foreground"
              style={{ left: x(index) }}
            >
              {era.label}
            </span>
          ) : null,
        )}
      </div>
    </Card>
  );
};

type Box = { x: number; y: number; w: number; h: number };

const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);

const worst = (row: number[], side: number) => {
  const sum = total(row);
  return Math.max(
    ...row.map((area) =>
      Math.max((side * side * area) / (sum * sum), (sum * sum) / (side * side * area)),
    ),
  );
};

const squarify = (values: number[], box: Box) => {
  const sum = total(values);
  if (sum <= 0 || box.w <= 0 || box.h <= 0) return [];
  const areas = values.map((value) => (value / sum) * box.w * box.h);
  const boxes: Box[] = [];
  let { x, y, w, h } = box;
  let start = 0;
  while (start < areas.length) {
    const side = Math.min(w, h);
    let end = start + 1;
    while (
      end < areas.length &&
      worst(areas.slice(start, end + 1), side) <= worst(areas.slice(start, end), side)
    )
      end++;
    const row = areas.slice(start, end);
    const wide = w >= h;
    const thick = total(row) / (wide ? h : w);
    let offset = 0;
    for (const area of row) {
      const length = area / thick;
      boxes.push(
        wide
          ? { x, y: y + offset, w: thick, h: length }
          : { x: x + offset, y, w: length, h: thick },
      );
      offset += length;
    }
    if (wide) {
      x += thick;
      w -= thick;
    } else {
      y += thick;
      h -= thick;
    }
    start = end;
  }
  return boxes;
};

const tone = (index: number) =>
  index === 0 ? "bg-chart-1 text-background" : index < 3 ? "bg-chart-3" : "bg-chart-4";

const Albums = (part: PartProps) => {
  const open = useOpen();
  const { data: stats } = useQuery(detailQueries.stats(part.filter));
  const rows = useTop(part, "albums", ALBUMS)?.filter((row) => Number(row.playtime) > 0);
  const [width, setWidth] = useState(0);
  const measure = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  if (!rows || !stats) return <Pending title="Albums" className="h-32" />;
  if (rows.length === 0) return null;
  const values = rows.map((row) => Number(row.playtime));
  const others = stats.albums - rows.length;
  const rest = others > 0 ? Math.max(stats.playtime - total(values), 0) : 0;
  const side =
    rest > 0
      ? Math.min(Math.max((rest / stats.playtime) * width, OTHERS_MIN), width * OTHERS_MAX)
      : 0;
  const boxes = squarify(values, { x: 0, y: 0, w: width - side, h: TREE });

  return (
    <Card title="Albums" caption={`${format.count(stats.albums)} played`}>
      <div
        ref={measure}
        role="img"
        aria-label="Treemap of listening time per album"
        className="relative"
        style={{ height: TREE }}
      >
        {rows.map((row, index) => {
          const box = boxes[index];
          if (!box) return null;
          const label = box.w >= 64 && box.h >= 36;
          const rank = !label && box.w >= 24 && box.h >= 20;
          return (
            <Tip
              key={row.id}
              text={`${row.name} · ${format.as(Number(row.playtime), "minutes")}`}
              render={
                <button
                  type="button"
                  onClick={() => open(bases.albums.opens, row)}
                  className={cn(
                    "absolute flex cursor-pointer flex-col overflow-hidden rounded-sm text-left text-foreground hover:brightness-110",
                    label ? "p-2" : "p-1",
                    tone(index),
                  )}
                  style={{ left: box.x + 1, top: box.y + 1, width: box.w - 2, height: box.h - 2 }}
                >
                  {label ? (
                    <>
                      <span className="truncate text-[11px] font-semibold">{row.name}</span>
                      <span className="truncate text-[10px]">
                        {format.as(Number(row.playtime), "minutes")}
                      </span>
                    </>
                  ) : rank ? (
                    <span className="text-[10px] opacity-80">{index + 1}</span>
                  ) : null}
                </button>
              }
            />
          );
        })}
        {side > 0 ? (
          <Tip
            text={`${format.count(others)} other albums · ${format.as(rest, "minutes")}`}
            render={
              <span
                className="absolute inset-y-px right-0 flex flex-col overflow-hidden rounded-sm border border-dashed border-accent p-2 text-muted-foreground"
                style={{ width: side - 1 }}
              >
                <span className="truncate text-[11px] font-semibold text-foreground">
                  +{format.count(others)}
                </span>
                <span className="truncate text-[10px]">{format.as(rest, "minutes")}</span>
              </span>
            }
          />
        ) : null}
      </div>
    </Card>
  );
};

const HeardWith = (part: PartProps) => {
  const open = useOpen();
  const rows = useTop(part, "artists")?.slice(0, 5);
  const [width, setWidth] = useState(0);
  const measure = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  if (!rows) return <Pending title="Heard with" className="h-40" />;
  if (rows.length === 0) return null;
  const link = Math.max(width * 0.45, 80);
  const max = Math.max(...rows.map((row) => Number(row.playtime)));
  const widths = rows.map((row) => 4 + (Number(row.playtime) / max) * 22);
  const height = rows.length * ROW;
  const total = widths.reduce((sum, width) => sum + width, 0);
  const starts = widths.map(
    (width, index) =>
      (height - total) / 2 + widths.slice(0, index).reduce((sum, w) => sum + w, 0) + width / 2,
  );

  return (
    <Card title="Heard with">
      <div ref={measure} className="flex">
        <svg
          width={link}
          height={height}
          viewBox={`0 0 ${link} ${height}`}
          className="shrink-0"
          aria-hidden
        >
          <rect
            x={0}
            y={(height - total) / 2}
            width={4}
            height={total}
            rx={1}
            fill="var(--chart-1)"
          />
          {rows.map((row, index) => {
            const from = starts[index] ?? 0;
            const to = index * ROW + ROW / 2;
            return (
              <path
                key={row.id}
                d={`M4,${from} C${link / 2},${from} ${link / 2},${to} ${link},${to}`}
                fill="none"
                stroke={index === 0 ? "var(--chart-1)" : "var(--chart-3)"}
                strokeOpacity={index === 0 ? 0.75 : 0.6}
                strokeWidth={widths[index]}
              />
            );
          })}
        </svg>
        <div className="flex min-w-0 flex-1 flex-col">
          {rows.map((row, index) => (
            <button
              key={row.id}
              type="button"
              onClick={() => open(bases.artists.opens, row)}
              className="flex h-8 cursor-pointer items-center gap-2.5 text-left hover:underline"
            >
              <span
                className={cn("w-1 shrink-0 rounded-xs", index === 0 ? "bg-chart-1" : "bg-chart-2")}
                style={{ height: widths[index] }}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-foreground",
                  index === 0 && "font-semibold",
                )}
              >
                {row.name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {format.as(Number(row.playtime), "minutes")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

const Genres = (part: PartProps) => {
  const rows = useTop(part, "genres")?.slice(0, 5);
  if (!rows) return <Pending title="Genres" className="h-32.5" />;
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((row) => Number(row.playtime)));

  return (
    <Card title="Genres">
      <div>
        {rows.map((row) => (
          <ShareRow key={row.id} label={row.name} value={Number(row.playtime) / max}>
            <b className="w-16">{format.as(Number(row.playtime), "minutes")}</b>
          </ShareRow>
        ))}
      </div>
    </Card>
  );
};

const Coverage = ({ filter }: PartProps) => {
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const { data: ever } = useQuery(detailQueries.stats({ rules: filter.rules }));
  const { data: discovered = 0 } = useQuery(detailQueries.discovered(filter));
  const played = stats?.tracks ?? 0;
  const known = ever?.tracks ?? 0;

  return (
    <Card title="Coverage">
      <div
        role="img"
        aria-label="Tracks played among the tracks you know"
        className="flex h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <span className="bg-chart-1" style={{ width: `${(discovered / (known || 1)) * 100}%` }} />
        <span
          className="bg-chart-3"
          style={{ width: `${((played - discovered) / (known || 1)) * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap justify-between gap-x-2.5">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-chart-1" />
          <b>{format.count(discovered)}</b> heard for the first time
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-chart-3" />
          <b>{format.count(played - discovered)}</b> already known
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-muted" />
          <b>{format.count(known - played)}</b> not played
        </span>
      </div>
    </Card>
  );
};

const Spread = (part: PartProps) => {
  const { data: stats } = useQuery(detailQueries.stats(part.filter));
  const rows = useTop(part, "tracks", SPREAD);
  if (!rows) return <Pending title="Track spread" className="h-26.25" />;
  const [first] = rows;

  return (
    <Card title="Track spread">
      <Strip
        className="h-14"
        label="Time per track, ranked"
        values={rows.map((row) => Number(row.playtime))}
        tip={(index) =>
          `${index + 1}. ${rows[index]?.name ?? ""} · ${format.as(Number(rows[index]?.playtime), "minutes")}`
        }
      />
      <div
        className="grid text-center text-[10px] text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${rows.length}, 1fr)` }}
      >
        {rows.map((row, index) => (
          <span key={row.id}>
            {index === 0 || (index + 1) % 5 === 0 || index === rows.length - 1 ? index + 1 : ""}
          </span>
        ))}
      </div>
      <span className="text-muted-foreground">
        Top track holds{" "}
        <b>
          {first && stats ? format.as(Number(first.playtime) / stats.playtime, "percent") : "-"}
        </b>{" "}
        of the time
      </span>
    </Card>
  );
};

export const Catalogue = (part: PartProps) => (
  <>
    <Coverage {...part} />
    <Spread {...part} />
    <Albums {...part} />
    <HeardWith {...part} />
    <Genres {...part} />
    <Eras {...part} />
  </>
);

const topTime = (rows: ListRow[] = []) =>
  rows.slice(0, 5).reduce((sum, row) => sum + Number(row.playtime), 0);

const Concentration = (part: PartProps) => {
  const { data: stats } = useQuery(detailQueries.stats(part.filter));
  const { data: discovered = 0 } = useQuery(detailQueries.discovered(part.filter));
  const tops = [
    { label: "Top 5 artists", playtime: topTime(useTop(part, "artists")) },
    { label: "Top 5 albums", playtime: topTime(useTop(part, "albums")) },
    { label: "Top 5 tracks", playtime: topTime(useTop(part, "tracks")) },
  ];

  return (
    <Card title="Concentration">
      <div>
        {tops.map(({ label, playtime }) => (
          <ShareRow key={label} label={label} value={stats ? playtime / stats.playtime : 0}>
            <span className="w-30">
              <b>{stats ? format.as(playtime / stats.playtime, "percent") : "-"}</b> ·{" "}
              {format.as(playtime, "minutes")}
            </span>
          </ShareRow>
        ))}
      </div>
      <Foot>
        <span>
          <b>{stats ? format.count(stats.artists) : "-"}</b> artists
        </span>
        <span>
          <b>{stats ? format.count(stats.albums) : "-"}</b> albums
        </span>
        <span>
          <b>{stats ? format.count(stats.tracks) : "-"}</b> tracks
        </span>
        <span>
          <b>{format.count(discovered)}</b> first listens
        </span>
      </Foot>
    </Card>
  );
};

export const Mix = (part: PartProps) => {
  const artists = useTop(part, "artists", 10);
  return (
    <>
      <Ranked title="Artists" base="artists" rows={artists} count={10} />
      <Concentration {...part} />
      <Top {...part} title="Top tracks" base="tracks" />
      <Top {...part} title="Top albums" base="albums" />
      <Eras {...part} />
    </>
  );
};
