import { Icon, Search01Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Input } from "@harmony/ui/components/input";
import { Kbd } from "@harmony/ui/components/kbd";
import { Spinner } from "@harmony/ui/components/spinner";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import type { ExplorerRow } from "@/data/explorer/list";

import { UNKNOWN_ID } from "@/data/explorer/list";
import { calendarDaySpan } from "@/data/sql/period-range";
import { ArtistsSelect } from "@/features/pick-artist";
import { Empty } from "@/shared/primitives/empty";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { useScope } from "@/shared/scope";

import type { ExplorerSearch, ExplorerSort, ExplorerTab } from "./search";

import { explorerQueries, PAGE_SIZE } from "./api";
import { BY, DEFAULT_SORT, DEFAULT_TAB, TABS } from "./search";
import { ExplorerTable } from "./table";
import { useExplorerKeys } from "./use-keys";

const LABELS: Record<ExplorerTab, string> = {
  artists: "Artists",
  tracks: "Tracks",
  albums: "Albums",
};

const SEARCH_DELAY = 200;

type ExplorerProps = {
  search: ExplorerSearch;
  // `replace` swaps the history entry instead of adding one, for fast changes such as typing.
  onChange: (patch: ExplorerSearch, replace?: boolean) => void;
  onOpenEntity: (tab: "artists" | "albums", id: number) => void;
};

export const Explorer = ({ search, onChange, onOpenEntity }: ExplorerProps) => {
  const tab = search.tab ?? DEFAULT_TAB;
  const sort = search.sort ?? DEFAULT_SORT;
  const q = search.q ?? "";
  const by = BY[tab];

  const scope = useScope();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(q);

  // The search box is local so typing stays smooth, the URL follows once typing pauses.
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setText(q);
  }
  useEffect(() => {
    if (text === q) return;
    const timer = window.setTimeout(() => onChange({ q: text || undefined }, true), SEARCH_DELAY);
    return () => window.clearTimeout(timer);
  }, [text, q, onChange]);

  const signature = [tab, sort, q, scope.artistId, +scope.from, +scope.to].join("|");
  const [paging, setPaging] = useState({ signature, limit: PAGE_SIZE });
  const limit = paging.signature === signature ? paging.limit : PAGE_SIZE;

  const list = useQuery(explorerQueries.list.queryOptions({ by, scope, sort, search: q, limit }));
  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;

  const [shown, setShown] = useState(signature);
  if (list.data && !list.isPlaceholderData && shown !== signature) setShown(signature);

  const ids = rows.map((row) => row.id);
  const trends = useQuery(explorerQueries.trends.queryOptions({ by, ids, scope })).data;
  const trendUnit = calendarDaySpan(scope.from, scope.to) < 31 ? "day" : "month";

  // The keyboard cursor resets whenever the list changes, like paging.
  const [cursor, setCursor] = useState({ signature, index: -1 });
  const active = cursor.signature === signature ? cursor.index : -1;
  const setActive = (index: number) => setCursor({ signature, index });

  useEffect(() => {
    document.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const open = (row: ExplorerRow) => {
    if (tab === "tracks") onChange({ track: row.id });
    else if (row.id !== UNKNOWN_ID) onOpenEntity(tab === "artists" ? "artists" : "albums", row.id);
  };

  useExplorerKeys({
    count: rows.length,
    active,
    onActive: setActive,
    onOpen: (index) => {
      const row = rows[index];
      if (row) open(row);
    },
    onSearch: () => inputRef.current?.focus(),
    onEscape: () => setActive(-1),
  });

  const setSort = (next: ExplorerSort) =>
    onChange({ sort: next === DEFAULT_SORT ? undefined : next });

  return (
    <>
      <Toolbar className="mx-auto w-full max-w-3xl shrink-0 border-b border-border px-4 pb-2">
        <Tabs
          value={tab}
          onValueChange={(next: ExplorerTab) =>
            onChange({ tab: next === DEFAULT_TAB ? undefined : next })
          }
        >
          <TabsList variant="line" className="h-7">
            {TABS.map((value) => (
              <TabsTrigger key={value} value={value} className="px-2 after:bg-primary">
                {LABELS[value]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {tab === "artists" ? null : <ArtistsSelect hotkey />}
        <Toolbar.End>
          <div className="relative">
            <Icon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={inputRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={`Search ${LABELS[tab].toLowerCase()}...`}
              aria-label="Search the list"
              className="w-44 pr-8 pl-7 sm:w-56"
            />
            <Kbd className="absolute top-1/2 right-1.5 -translate-y-1/2">/</Kbd>
          </div>
        </Toolbar.End>
      </Toolbar>

      <Pane.Body width="column" className="px-0 pt-0">
        {list.isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <Empty className="h-40">
            {q ? (
              <>
                <p>
                  No {LABELS[tab].toLowerCase()} match “{q}”.
                </p>
                <Button variant="outline" onClick={() => onChange({ q: undefined })}>
                  Clear search
                </Button>
              </>
            ) : (
              <p>No listening in this period.</p>
            )}
          </Empty>
        ) : (
          <ExplorerTable
            rows={rows}
            trends={trends}
            trendUnit={trendUnit}
            sort={sort}
            onSort={setSort}
            active={active}
            selectedId={tab === "tracks" ? search.track : undefined}
            onOpen={open}
            version={shown}
          />
        )}
        {rows.length < total ? (
          <div className="flex justify-center p-3">
            <Button
              variant="outline"
              onClick={() => setPaging({ signature, limit: limit + PAGE_SIZE })}
            >
              Show more
            </Button>
          </div>
        ) : null}
      </Pane.Body>
    </>
  );
};
