import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@harmony/ui/components/sheet";
import { Spinner } from "@harmony/ui/components/spinner";
import { cn } from "@harmony/ui/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";

import type { TrackDetails } from "@/data/tracks/get";

import { trackQueries } from "@/entities/track";
import { Empty } from "@/shared/primitives/empty";
import { Media } from "@/shared/primitives/media";
import { Meta } from "@/shared/primitives/meta";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { usePeriod } from "@/shared/scope";

import { Interactions } from "./interactions";
import { Overview } from "./overview";
import { useTrackPanel } from "./use-track-panel";

const TrackLinks = ({ track }: { track: TrackDetails }) => {
  const { packageId } = useParams({ strict: false });
  if (!packageId) return null;

  return (
    <Meta>
      {track.artists.slice(0, 2).map((artist) => (
        <Link
          key={artist.id}
          to="/app/$packageId/artists/$artistId"
          params={{ packageId, artistId: String(artist.id) }}
          className="truncate underline-offset-2 hover:text-foreground hover:underline"
        >
          {artist.name}
        </Link>
      ))}
      {track.albumId !== null && track.albumName ? (
        <Link
          to="/app/$packageId/albums/$albumId"
          params={{ packageId, albumId: String(track.albumId) }}
          className="truncate underline-offset-2 hover:text-foreground hover:underline"
        >
          {track.albumName}
        </Link>
      ) : null}
    </Meta>
  );
};

// Nothing to chart when the track was not played in the period: say so instead of showing zeros.
const TrackBody = ({ track }: { track: TrackDetails }) => {
  const { from, to } = usePeriod();
  const { data } = useQuery(trackQueries.overview.queryOptions({ trackId: track.id, from, to }));

  if (data && data.streams === 0) {
    return <Empty className="py-8">“{track.name}” was not played in this period.</Empty>;
  }

  return <Overview trackId={track.id} />;
};

const TrackDetailsView = ({ track }: { track: TrackDetails }) => {
  // Each track opens on its overview.
  const [interactionsFor, setInteractionsFor] = useState<number | null>(null);
  const showInteractions = interactionsFor === track.id;
  const setShowInteractions = (show: boolean) => setInteractionsFor(show ? track.id : null);

  return (
    <Pane className="h-full">
      <Pane.Header>
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
        ) : null}
        <SheetTitle className={cn("font-semibold", showInteractions && "sr-only")}>
          Track Details
        </SheetTitle>
        <Toolbar.End>
          <SheetClose render={<Button variant="ghost" size="icon" className="-mr-2" />}>
            <Icon icon={Cancel01Icon} />
            <span className="sr-only">Close</span>
          </SheetClose>
        </Toolbar.End>
      </Pane.Header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "flex h-full w-[200%] transition-transform duration-300 ease-out",
            showInteractions ? "-translate-x-1/2" : "translate-x-0",
          )}
        >
          <div className="flex w-1/2 flex-col overflow-hidden">
            <Media size="lg" className="px-4">
              <Media.Art src={track.image} alt={track.name} variant="glow" />
              <Media.Body>
                <Media.Title className="line-clamp-2 whitespace-normal">{track.name}</Media.Title>
                <Media.Sub className="whitespace-normal">
                  <TrackLinks track={track} />
                </Media.Sub>
              </Media.Body>
            </Media>
            <Pane.Body className="px-4 pt-3">
              <TrackBody track={track} />
            </Pane.Body>
            <div className="shrink-0 border-t border-border px-4 py-2">
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
    </Pane>
  );
};

// The track named by the `track` search param, in a sheet over the page.
export const TrackSheet = () => {
  const { trackId, setTrack } = useTrackPanel();
  // The last track stays shown while the sheet slides out.
  const { data: track } = useQuery({
    ...trackQueries.get.queryOptions(trackId ?? null),
    placeholderData: keepPreviousData,
  });

  return (
    <Sheet open={trackId !== undefined} onOpenChange={(open) => !open && setTrack(undefined)}>
      <SheetContent side="right" showCloseButton={false}>
        {track ? <TrackDetailsView track={track} /> : <TrackLoading />}
      </SheetContent>
    </Sheet>
  );
};

const TrackLoading = () => (
  <Pane className="h-full">
    <Pane.Header>
      <SheetTitle className="font-semibold">Track Details</SheetTitle>
    </Pane.Header>
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  </Pane>
);
