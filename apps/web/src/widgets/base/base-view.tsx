import { Cancel01Icon, Icon, Search01Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Input } from "@harmony/ui/components/input";
import { Kbd } from "@harmony/ui/components/kbd";
import { Spinner } from "@harmony/ui/components/spinner";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import type { Rule } from "@/data/filter";

import { type ExplorerBaseId, type ListRow } from "@/data/bases";
import { useDetail } from "@/features/detail-panel";
import { Empty } from "@/shared/primitives/empty";
import { usePeriod } from "@/shared/scope";

import { baseQueries } from "./api";
import { SortChip, ViewMenu } from "./controls";
import { Gallery } from "./gallery";
import { useOpen } from "./open";
import { Rules } from "./rules";
import { BaseTable } from "./table";
import { useRowKeys } from "./use-keys";
import { listQuery, PAGE_SIZE, resolveView, type ViewState } from "./view";

type BaseViewProps = {
  state: ViewState;
  // `replace` swaps the history entry instead of adding one, for fast changes such as typing.
  onChange: (patch: ViewState, replace?: boolean) => void;
  fallback?: ExplorerBaseId;
  // Rules set by the page, such as the artist of an artist page. They are not shown as chips.
  fixed?: readonly Rule[];
  page?: boolean;
  limit?: number;
};

const SEARCH_DELAY = 200;

// Loads the next rows once the end of the list comes near. Keyed by the row count, so a new
// observer checks again after each load when the end is still in view.
const LoadMore = ({ loading, onMore }: { loading: boolean; onMore: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || asked || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setAsked(true);
        onMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [asked, loading, onMore]);

  return (
    <div ref={ref} className="flex h-12 items-center justify-center">
      {asked || loading ? <Spinner /> : null}
    </div>
  );
};

export const BaseView = ({
  state,
  onChange,
  fallback = "artists",
  fixed = [],
  page = false,
  limit: first = PAGE_SIZE,
}: BaseViewProps) => {
  const view = resolveView(state, fallback);
  const period = usePeriod();
  const open = useOpen();
  const { current } = useDetail();
  const inputRef = useRef<HTMLInputElement>(null);

  // The search box is local so typing stays smooth, the view follows once typing pauses.
  const [text, setText] = useState(view.q);
  const [prevQ, setPrevQ] = useState(view.q);
  if (view.q !== prevQ) {
    setPrevQ(view.q);
    setText(view.q);
  }
  const [searching, setSearching] = useState(false);
  const searchOpen = searching || text !== "";
  useEffect(() => {
    if (text === view.q) return;
    const timer = window.setTimeout(() => onChange({ q: text || undefined }, true), SEARCH_DELAY);
    return () => window.clearTimeout(timer);
  }, [text, view.q, onChange]);

  const [more, setMore] = useState({ key: "", limit: first });
  const signature = JSON.stringify(listQuery(view, period, 0, fixed));
  const limit = more.key === signature ? more.limit : first;
  const query = listQuery(view, period, limit, fixed);
  const list = useQuery(baseQueries.list(query));
  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;

  const ids = view.view === "table" ? rows.map((row) => row.id) : [];
  const trends = useQuery(
    baseQueries.trends({
      base: view.base.id,
      ids,
      filter: { ...period, rules: query.filter.rules },
    }),
  ).data;

  const [cursor, setCursor] = useState({ signature, index: -1 });
  const active = page && cursor.signature === signature ? cursor.index : -1;
  useEffect(() => {
    document.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const openRow = (row: ListRow) => open(view.base.opens, row);
  const selectedOf = (row: ListRow) =>
    current?.kind === view.base.opens && current.id === (row.track ?? row.id);

  useRowKeys({
    enabled: page,
    count: rows.length,
    active,
    onActive: (index) => setCursor({ signature, index }),
    onOpen: (index) => {
      const row = rows[index];
      if (row) openRow(row);
    },
    onSearch: () => {
      setSearching(true);
      inputRef.current?.focus();
    },
    onEscape: () => setCursor({ signature, index: -1 }),
  });

  const tools = (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      {searchOpen ? (
        <div className="relative">
          <Icon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={inputRef}
            autoFocus={searching}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onBlur={() => setSearching(false)}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              setText("");
              event.currentTarget.blur();
            }}
            placeholder={`Search ${view.base.title.toLowerCase()}...`}
            aria-label={`Search ${view.base.title.toLowerCase()}`}
            className="w-40 pr-7 pl-7 sm:w-48"
          />
          {text ? (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setText("")}
              className="absolute top-1/2 right-1.5 flex size-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Icon icon={Cancel01Icon} className="size-3" />
            </button>
          ) : page ? (
            <Kbd className="absolute top-1/2 right-1.5 -translate-y-1/2">/</Kbd>
          ) : null}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Search ${view.base.title.toLowerCase()}`}
          onClick={() => setSearching(true)}
        >
          <Icon icon={Search01Icon} />
        </Button>
      )}
      <ViewMenu view={view} onChange={onChange} />
    </div>
  );

  const queryLine = (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
      <SortChip view={view} onChange={onChange} />
      <Rules
        base={view.base}
        rules={view.rules}
        scope={period}
        onRules={(rules) => onChange({ rules: rules.length > 0 ? rules : undefined })}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "border-b border-border pb-1",
          page ? "sticky top-0 z-20 bg-background pt-1" : "",
        )}
      >
        <div className="flex items-center gap-2">
          {queryLine}
          {tools}
        </div>
      </div>

      {list.isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <Empty className="h-40">
          {view.q || view.rules.length > 0 ? (
            <>
              <p>No {view.base.title.toLowerCase()} match this view.</p>
              <Button
                variant="outline"
                onClick={() => onChange({ q: undefined, rules: undefined })}
              >
                Clear filters
              </Button>
            </>
          ) : (
            <p>No listening in this period.</p>
          )}
        </Empty>
      ) : view.view === "gallery" ? (
        <Gallery view={view} rows={rows} selected={selectedOf} onOpen={openRow} />
      ) : (
        <BaseTable
          view={view}
          rows={rows}
          trends={trends}
          active={active}
          selected={selectedOf}
          onOpen={openRow}
        />
      )}
      {rows.length < total ? (
        <LoadMore
          key={rows.length}
          loading={list.isFetching}
          onMore={() => setMore({ key: signature, limit: limit + first })}
        />
      ) : null}
    </div>
  );
};
