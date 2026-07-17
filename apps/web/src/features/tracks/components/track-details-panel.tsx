import { Cancel01Icon, Icon, Loading03Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useState } from "react";

import type { TrackDetails } from "@/features/tracks/queries/get";

import { CatalogImage } from "@/components/catalog/catalog-image";

import { Interactions } from "./details/interactions";

type TrackDetailsPanelProps = {
  track: TrackDetails | undefined;
  loading?: boolean;
  onClose: () => void;
};

export const TrackDetailsPanel = ({ track, onClose }: TrackDetailsPanelProps) => {
  const [tab, setTab] = useState("overview");

  return (
    <aside className="flex size-full flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center justify-between px-4 py-2">
        <h2 className="font-semibold">Track Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close track details">
          <Icon icon={Cancel01Icon} strokeWidth={2} />
        </Button>
      </div>
      {track ? (
        <>
          <div className="flex shrink-0 items-center gap-3 px-4 pb-2">
            <CatalogImage size="xl" image={track.image} alt={track.name} blur />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium">{track.name}</p>
              {track.description ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">{track.description}</p>
              ) : null}
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
            <div className="shrink-0 px-4 py-2">
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="min-h-0 flex-1 overflow-hidden">
              <div>Overview</div>
            </TabsContent>
            <TabsContent value="interactions" keepMounted className="min-h-0 flex-1 overflow-hidden">
              <Interactions trackId={track.id} enabled={tab === "interactions"} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
          <Icon icon={Loading03Icon} className="size-4 animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      )}
    </aside>
  );
};
