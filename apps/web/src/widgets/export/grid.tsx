import { ArrowDown01Icon, ArrowUp01Icon, Icon } from "@harmony/icons";
import { Spinner } from "@harmony/ui/components/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Fragment, useEffect, useRef, type ReactNode } from "react";

import {
  COLUMNS,
  type ColumnId,
  type ExportCell,
  type ExportQuery,
  type ExportLine,
} from "@/data/export";
import { formatTrail, type Detail } from "@/features/detail-panel";
import { format } from "@/shared/lib/format";
import { Empty } from "@/shared/primitives/empty";

import { exportQueries } from "./api";

const ROW = 24;

const WIDTHS = {
  played_at: 140,
  track: 184,
  artists: 152,
  album: 152,
  album_artists: 152,
  genres: 152,
  release_date: 120,
  ms_played: 104,
  platform: 96,
  skipped: 88,
  shuffle: 80,
  offline: 80,
  track_id: 96,
} as const;

const Cell = ({ value }: { value: ExportCell }) => {
  if (value === null) return <span className="text-muted-foreground/60">NULL</span>;
  if (typeof value === "boolean")
    return (
      <span className={value ? "text-foreground" : "text-muted-foreground"}>{String(value)}</span>
    );
  return <span className="truncate">{value}</span>;
};

type OpenProps = {
  detail: Detail;
  children: ReactNode;
};

const Open = ({ detail, children }: OpenProps) => (
  <Link
    from="/app/$packageId/export"
    to="."
    search={(prev) => ({ ...prev, detail: formatTrail([detail]) })}
    className="underline-offset-2 outline-none hover:underline focus-visible:underline"
  >
    {children}
  </Link>
);

type ValueProps = {
  id: ColumnId;
  row: ExportLine;
};

const Value = ({ id, row }: ValueProps) => {
  const value = row.cells[id];
  const track = row.cells.track_id;
  if (id === "track" && typeof track === "number" && value !== null)
    return (
      <span className="truncate">
        <Open detail={{ kind: "track", id: track }}>{value}</Open>
      </span>
    );
  if (id === "album" && row.album !== null && value !== null)
    return (
      <span className="truncate">
        <Open detail={{ kind: "album", id: row.album }}>{value}</Open>
      </span>
    );
  const links = {
    artists: row.artists.map((artist) => ({
      kind: "artist" as const,
      id: artist.id,
      name: artist.name,
    })),
    album_artists: row.albumArtists.map((artist) => ({
      kind: "artist" as const,
      id: artist.id,
      name: artist.name,
    })),
    genres: row.genres.map((genre) => ({ kind: "genre" as const, id: genre, name: genre })),
  };
  const list = id === "artists" || id === "album_artists" || id === "genres" ? links[id] : [];
  if (list.length > 0)
    return (
      <span className="truncate">
        {list.map(({ name, ...detail }, index) => (
          <Fragment key={detail.id}>
            {index > 0 ? ", " : null}
            <Open detail={detail}>{name}</Open>
          </Fragment>
        ))}
      </span>
    );
  if (id === "ms_played" && typeof value === "number")
    return (
      <Tooltip>
        <TooltipTrigger render={<span />}>{value}</TooltipTrigger>
        <TooltipContent>{format.clock(value)}</TooltipContent>
      </Tooltip>
    );
  return <Cell value={value} />;
};

type GridProps = {
  query: ExportQuery;
  columns: readonly ColumnId[];
  onSort: (column: ColumnId) => void;
};

export const Grid = ({ query, columns, onSort }: GridProps) => {
  const { data, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage } = useInfiniteQuery(
    exportQueries.rows(query),
  );
  const rows = data?.pages.flat() ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const template = {
    gridTemplateColumns: columns.map((id) => `${WIDTHS[id]}px`).join(" "),
  };

  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    estimateSize: () => ROW,
    getScrollElement: () => scrollRef.current,
    overscan: 12,
  });
  const items = virtualizer.getVirtualItems();
  const last = items.at(-1)?.index ?? 0;

  useEffect(() => {
    if (last >= rows.length - 1 && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [last, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="relative min-h-0 flex-1">
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Spinner />
        </div>
      ) : null}
      <div ref={scrollRef} className="absolute inset-0 overflow-auto">
        <div className="w-max min-w-full text-xs tabular-nums">
          <div
            className="sticky top-0 z-10 grid border-y border-border bg-background"
            style={template}
          >
            {columns.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onSort(id)}
                className="flex h-6 cursor-pointer items-center justify-between gap-1 border-r border-border px-1.5 text-left outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
              >
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="truncate font-medium text-foreground">{id}</span>
                  <span className="font-mono text-micro text-muted-foreground">
                    {COLUMNS[id].type}
                  </span>
                </span>
                {query.sort === id ? (
                  <Icon
                    icon={query.desc ? ArrowDown01Icon : ArrowUp01Icon}
                    size={12}
                    className="shrink-0 text-primary"
                  />
                ) : null}
              </button>
            ))}
          </div>
          {!isLoading && rows.length === 0 ? (
            <Empty className="py-8">No plays match these filters.</Empty>
          ) : (
            <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
              {items.map((item) => {
                const row = rows[item.index];
                return (
                  <div
                    key={item.key}
                    className="absolute inset-x-0 grid h-6 border-b border-border hover:bg-muted/50"
                    style={{ ...template, transform: `translateY(${item.start}px)` }}
                  >
                    {row ? (
                      columns.map((id) => (
                        <div
                          key={id}
                          title={
                            row.cells[id] === null || id === "ms_played"
                              ? undefined
                              : String(row.cells[id])
                          }
                          className={cn(
                            "flex min-w-0 items-center border-r border-border px-1.5 whitespace-nowrap",
                            COLUMNS[id].type === "int" && "justify-end",
                          )}
                        >
                          <Value id={id} row={row} />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full flex items-center px-1.5">
                        <Spinner />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
