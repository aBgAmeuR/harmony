import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import type { TopRow } from "@/data/bases";

import { Media } from "@/shared/primitives/media";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Section } from "@/shared/primitives/section";

import { overviewQueries, TOP } from "./api";
import { useRanges } from "./use-range";

type By = "tracks" | "albums" | "artists";

const LISTS = [
  { by: "artists", label: "Artists", sub: false },
  { by: "tracks", label: "Tracks", sub: true },
  { by: "albums", label: "Albums", sub: true },
] as const;

type TopWidgetProps = {
  selected: (by: By, row: TopRow) => boolean;
  onOpen: (by: By, row: TopRow) => void;
};

type TopListProps = TopWidgetProps & (typeof LISTS)[number];

const TopList = ({ by, label, sub, selected, onOpen }: TopListProps) => {
  const { range } = useRanges();
  const { data = [], isPending } = useQuery(
    overviewQueries.top({ base: by, filter: range, limit: TOP }),
  );

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex h-9 items-center justify-between border-b">
        <span className="text-sm font-semibold">{label}</span>
        <Link
          from="/app/$packageId"
          to="./explorer"
          search={{ base: by }}
          preload="intent"
          className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-foreground"
        >
          View all
          <Icon icon={ArrowRight01Icon} size={12} />
        </Link>
      </div>
      {isPending ? (
        Array.from({ length: TOP }, (_, i) => (
          <div key={i} className="flex h-16 items-center border-b">
            <Skeleton className="h-9 w-full" />
          </div>
        ))
      ) : data.length === 0 ? (
        <p className="py-4 text-xs text-muted-foreground">Nothing played in this period.</p>
      ) : (
        data.map((row, index) => (
          <button
            key={row.id}
            type="button"
            data-selected={selected(by, row) || undefined}
            onClick={() => onOpen(by, row)}
            className="flex h-12 cursor-pointer items-center gap-3 border-b px-1 text-left transition-colors hover:bg-muted/40 data-selected:bg-muted/60"
          >
            <Rank n={index + 1} />
            <Media className="flex-1">
              <Media.Art src={row.image} alt={row.name} fallback="initials" />
              <Media.Body>
                <Media.Title>{row.name}</Media.Title>
                {sub && row.description ? <Media.Sub>{row.description}</Media.Sub> : null}
              </Media.Body>
            </Media>
            <Num value={row.playtime} kind="minutes" className="text-muted-foreground" />
          </button>
        ))
      )}
    </div>
  );
};

export const TopWidget = (props: TopWidgetProps) => (
  <Section size="md">
    <Section.Title>On repeat</Section.Title>
    <Section.Text>Your most played music in this period.</Section.Text>
    <div className="@container mt-3">
      <div className="grid gap-8 @2xl:grid-cols-3">
        {LISTS.map((list) => (
          <TopList key={list.by} {...list} {...props} />
        ))}
      </div>
    </div>
  </Section>
);
