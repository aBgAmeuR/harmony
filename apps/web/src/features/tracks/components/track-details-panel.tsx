import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Icon,
  Loading03Icon,
} from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { ScrollArea } from "@harmony/ui/components/scroll-area";
import { useEffect, useState } from "react";

import type { TrackDetails } from "@/features/tracks/queries/get";

import { Cover } from "@/components/cover";

import { Interactions } from "./details/interactions";
import { Overview } from "./details/overview";

type TrackDetailsPanelProps = {
  track: TrackDetails | undefined;
  loading?: boolean;
  onClose: () => void;
};

export const TrackDetailsPanel = ({ track, onClose }: TrackDetailsPanelProps) => {
  const [showInteractions, setShowInteractions] = useState(false);

  useEffect(() => {
    setShowInteractions(false);
  }, [track?.id]);

  return (
    <aside className="flex size-full flex-col overflow-hidden border-t border-border bg-background">
      <div className="flex shrink-0 items-center justify-between px-4 py-2">
        {showInteractions ? (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => setShowInteractions(false)}
          >
            <Icon icon={ArrowLeft01Icon} />
            Overview
          </Button>
        ) : (
          <h2 className="font-semibold">Track Details</h2>
        )}
        <Button variant="ghost" size="icon" className="-mr-2" onClick={onClose}>
          <Icon icon={Cancel01Icon} />
        </Button>
      </div>

      {track ? (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            className={`flex h-full w-[200%] transition-transform duration-300 ease-out ${
              showInteractions ? "-translate-x-1/2" : "translate-x-0"
            }`}
          >
            <div className="flex w-1/2 flex-col overflow-hidden">
              <div className="flex items-center gap-3 px-4">
                <Cover size="xl" src={track.image} alt={track.name} blur />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">{track.name}</p>
                  {track.description ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {track.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <ScrollArea className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
                <Overview trackId={track.id} />
              </ScrollArea>
              <div className="w-full border-t border-border px-4 py-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowInteractions(true)}
                >
                  View interactions
                  <Icon icon={ArrowRight01Icon} />
                </Button>
              </div>
            </div>
            <div className="w-1/2 overflow-hidden">
              <Interactions trackId={track.id} enabled={showInteractions} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
          <Icon icon={Loading03Icon} className="size-4 animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      )}
    </aside>
  );
};
