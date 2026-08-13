import { ArrowLeft01Icon, ArrowRight01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Cover } from "@/components/cover";
import { useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

import type { ListeningSessions, ListeningStreak, TimelineEvent } from "../types";

import { formatCount, formatMilestoneDate, sessionDurationParts, yearOf } from "../format";

function withRecordEvents(
  events: TimelineEvent[],
  streak: ListeningStreak | undefined,
  sessions: ListeningSessions | undefined,
): TimelineEvent[] {
  const extra: TimelineEvent[] = [];

  if (sessions && sessions.longestMinutes > 0 && sessions.longestStart) {
    const duration = sessionDurationParts(sessions.longestMinutes, "long");
    extra.push({
      id: `session-${sessions.longestStart}`,
      date: sessions.longestStart,
      label: "Record session",
      entity: `${duration.value} ${duration.unit} of continuous listening`,
      subtitle: "",
      image: null,
    });
  }

  if (streak && streak.longestDays >= 2 && streak.longestEnd) {
    extra.push({
      id: `streak-${streak.longestEnd}`,
      date: streak.longestEnd,
      label: "Longest streak",
      entity: `${formatCount(streak.longestDays)} days of daily listening`,
      subtitle: "",
      image: null,
    });
  }

  return [...events, ...extra].toSorted(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
}

function TimelineSpine({ isFirst, isLast }: { isFirst: boolean; isLast: boolean }) {
  const hideLine = isFirst && isLast;
  return (
    <div className="relative flex h-4 w-full items-center">
      {hideLine ? null : (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 h-px -translate-y-1/2 bg-border",
            isFirst
              ? "inset-s-3 inset-e-0"
              : isLast
                ? "inset-s-0 inset-e-[calc(100%-0.75rem)]"
                : "inset-x-0",
          )}
        />
      )}
    </div>
  );
}

function useHorizontalPager(itemCount: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [itemCount, update]);

  const page = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * Math.max(el.clientWidth * 0.7, 208),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return { ref, canPrev, canNext, page };
}

export function TimelineWidget() {
  const filter = useFilter();
  const { data: events = [], isPending } = useQuery(query.milestones.timeline.queryOptions(filter));
  const { data: streak } = useQuery(query.milestones.streak.queryOptions(filter));
  const { data: sessions } = useQuery(query.milestones.sessions.queryOptions(filter));

  const rows = useMemo(
    () => withRecordEvents(events, streak, sessions),
    [events, streak, sessions],
  );

  const { ref, canPrev, canNext, page } = useHorizontalPager(rows.length);
  const showNav = canPrev || canNext;
  const showYear = rows.map((event, index) => {
    const year = yearOf(event.date);
    if (year === null) return false;
    const previousEvent = rows[index - 1];
    const previous = previousEvent ? yearOf(previousEvent.date) : null;
    return year !== previous;
  });

  const pager = showNav ? (
    <div className="flex gap-1">
      <Button
        type="button"
        size="icon"
        variant="secondary"
        disabled={!canPrev}
        aria-label="Previous milestones"
        onClick={() => page(-1)}
      >
        <Icon icon={ArrowLeft01Icon} />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        disabled={!canNext}
        aria-label="Next milestones"
        onClick={() => page(1)}
      >
        <Icon icon={ArrowRight01Icon} />
      </Button>
    </div>
  ) : null;

  if (!isPending && rows.length === 0) {
    return (
      <section className="space-y-3" aria-labelledby="milestones-timeline">
        <h2 id="milestones-timeline" className="text-base font-semibold tracking-tight">
          Milestones timeline
        </h2>
        <p className="text-sm text-muted-foreground">No milestones in this range.</p>
      </section>
    );
  }

  return (
    <section className="space-y-1" aria-labelledby="milestones-timeline">
      <header className="flex items-center justify-between gap-2">
        <h2 id="milestones-timeline" className="text-base font-semibold tracking-tight">
          Milestones timeline
        </h2>
        {pager}
      </header>
      <TooltipProvider delay={80}>
        <div
          ref={ref}
          className="snap-x snap-proximity overflow-x-auto overscroll-x-contain"
          role="region"
          aria-label="Milestones timeline"
        >
          <ol className="flex w-max min-w-full list-none p-0">
            {rows.map((event, index) => {
              const year = yearOf(event.date);
              const dateValue = event.date.slice(0, 10);
              const dateLabel = formatMilestoneDate(event.date);

              return (
                <li key={event.id} className="flex w-52 shrink-0 snap-start flex-col pb-3">
                  <div className="min-h-7 text-xl font-bold tracking-tight">
                    {showYear[index] ? year : null}
                  </div>
                  <div className="relative w-full">
                    <TimelineSpine isFirst={index === 0} isLast={index === rows.length - 1} />
                    <div className="absolute inset-y-0 start-0 flex items-center">
                      <Tooltip>
                        <TooltipTrigger
                          aria-label={`${event.label}, ${dateLabel}`}
                          className="relative z-1 flex size-6 items-center justify-center rounded-full"
                        >
                          <span
                            className="size-2 rounded-full bg-foreground ring-4 ring-background"
                            aria-hidden="true"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <time dateTime={dateValue}>{dateLabel}</time>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="min-w-0 ps-3">
                    <p className="truncate text-sm font-medium">{event.label}</p>
                    {event.entity ? (
                      <div className="mt-1.5 flex min-w-0 items-center gap-2">
                        <Cover src={event.image} alt={event.entity} />
                        <div className="min-w-0">
                          <p className="truncate text-xs">{event.entity}</p>
                          {event.subtitle ? (
                            <p className="truncate text-[10px] text-muted-foreground">
                              {event.subtitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </TooltipProvider>
    </section>
  );
}
