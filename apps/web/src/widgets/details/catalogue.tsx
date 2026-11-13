import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { bases, type ListRow } from "@/data/bases";
import { format } from "@/shared/lib/format";
import { useOpen } from "@/widgets/base/open";

import { detailQueries } from "./api";
import { Card, Foot, Ranked, ShareRow, Strip, Tip, Top, useTop, type PartProps } from "./kit";

const SPREAD = 22;
const ROW = 32;
const TILES = ["bg-chart-1 text-background", "bg-chart-2 text-background", "bg-chart-3"];

const Eras = ({ filter }: PartProps) => {
  const { data: eras = [] } = useQuery(detailQueries.eras(filter));
  if (eras.length < 2) return null;
  const max = Math.max(...eras.map((era) => era.value));
  const x = (index: number) => `${((index + 0.5) / eras.length) * 100}%`;

  return (
    <Card title="Release years" caption="circle area is time listened">
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

const Albums = (part: PartProps) => {
  const { data: stats } = useQuery(detailQueries.stats(part.filter));
  const top = useTop(part, "albums", 3);
  const rest = (stats?.playtime ?? 0) - top.reduce((sum, row) => sum + Number(row.playtime), 0);
  const tiles = [
    ...top.map((row) => ({ name: row.name, playtime: Number(row.playtime) })),
    ...((stats?.albums ?? 0) > top.length && rest > 0
      ? [
          {
            name: `${format.count((stats?.albums ?? 0) - top.length)} other albums`,
            playtime: rest,
          },
        ]
      : []),
  ];

  return (
    <Card
      title="Albums"
      caption={`${stats ? format.count(stats.albums) : "-"} played · area is time listened`}
    >
      <div role="img" aria-label="Treemap of listening time" className="flex h-30 gap-0.5">
        {tiles.map((tile, index) => (
          <Tip
            key={tile.name}
            text={`${tile.name} · ${format.as(tile.playtime, "minutes")}`}
            render={
              <span
                className={cn(
                  "flex min-w-0 flex-col overflow-hidden rounded-sm p-2 text-foreground",
                  TILES[index] ?? "bg-muted",
                )}
                style={{ flexGrow: tile.playtime, flexBasis: 0 }}
              >
                <span className="truncate text-[11px] font-semibold">{tile.name}</span>
                <span className="truncate text-[10px]">{format.as(tile.playtime, "minutes")}</span>
              </span>
            }
          />
        ))}
      </div>
    </Card>
  );
};

const HeardWith = (part: PartProps) => {
  const open = useOpen();
  const rows = useTop(part, "artists").slice(0, 5);
  const [width, setWidth] = useState(0);
  const measure = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
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
    <Card title="Heard with" caption="link width is time shared">
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
  const rows = useTop(part, "genres").slice(0, 5);
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
    <Card title="Coverage" caption={`${played} played of the ${known} tracks you know`}>
      <div
        role="img"
        aria-label="Tracks played among the tracks you know"
        className="flex flex-wrap gap-1"
      >
        {Array.from({ length: known }, (_, index) => (
          <span
            key={index}
            className={cn("size-2 rounded-full", index < played ? "bg-chart-1" : "bg-muted")}
          />
        ))}
      </div>
      <Foot>
        <span>
          <b>{format.count(discovered)}</b> heard for the first time
        </span>
        <span>
          <b>{format.count(played - discovered)}</b> already known
        </span>
        <span>
          <b>{format.count(known - played)}</b> not played
        </span>
      </Foot>
    </Card>
  );
};

const Spread = (part: PartProps) => {
  const { data: stats } = useQuery(detailQueries.stats(part.filter));
  const rows = useTop(part, "tracks", SPREAD);
  const [first] = rows;

  return (
    <Card title="Track spread" caption={`time per track, ${rows.length} most played`}>
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

const topTime = (rows: ListRow[]) =>
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
    <Card title="Concentration" caption="share of the genre held by your top 5">
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
      <Ranked title="Artists" base="artists" rows={artists} />
      <Concentration {...part} />
      <Top {...part} title="Top tracks" base="tracks" />
      <Top {...part} title="Top albums" base="albums" />
      <Eras {...part} />
    </>
  );
};
