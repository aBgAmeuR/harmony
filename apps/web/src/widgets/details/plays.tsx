import { Icon, NextIcon, ShuffleIcon, WifiOffIcon } from "@harmony/icons";
import { Spinner } from "@harmony/ui/components/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import type { Filter } from "@/data/filter";

import { useDetail } from "@/features/detail-panel";
import { format } from "@/shared/lib/format";
import { Empty } from "@/shared/primitives/empty";

import { detailQueries } from "./api";
import { Platform } from "./platform";

const FLAGS = [
  { key: "offline", label: "Offline", icon: WifiOffIcon },
  { key: "shuffle", label: "Shuffled", icon: ShuffleIcon },
  { key: "skipped", label: "Skipped", icon: NextIcon },
] as const;

const ROW = 36;

type PlaysProps = {
  filter: Filter;
  named: boolean;
};

export const Plays = ({ filter, named }: PlaysProps) => {
  const { data: plays = [], isLoading } = useQuery(detailQueries.plays(filter));
  const { open } = useDetail();
  const scrollRef = useRef<HTMLDivElement>(null);

  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: plays.length,
    estimateSize: () => ROW,
    getScrollElement: () => scrollRef.current,
    overscan: 8,
  });

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (plays.length === 0) return <Empty className="py-8">No plays in this period.</Empty>;

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
      <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => {
          const play = plays[item.index];
          if (!play) return null;
          return (
            <div
              key={play.id}
              className="absolute inset-x-0 flex h-9 items-center gap-3 border-b border-border px-4 text-xs"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <span className="w-36 shrink-0 text-muted-foreground tabular-nums">
                {format.dateTime(play.played)}
              </span>
              {named ? (
                <button
                  type="button"
                  onClick={() => open({ kind: "track", id: play.track })}
                  className="min-w-0 flex-1 cursor-pointer truncate text-left underline-offset-2 outline-none hover:underline focus-visible:underline"
                >
                  {play.name}
                </button>
              ) : (
                <span className="flex-1" />
              )}
              <span className="shrink-0 tabular-nums">{format.duration(play.ms)}</span>
              <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                <Platform platform={play.platform} />
                {FLAGS.map(({ key, label, icon }) =>
                  play[key] ? (
                    <Tooltip key={key}>
                      <TooltipTrigger render={<Icon icon={icon} />} />
                      <TooltipContent>
                        <p>{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span key={key} className="size-4" />
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
