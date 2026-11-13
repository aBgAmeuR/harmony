import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, Icon } from "@harmony/icons";
import { Button, buttonVariants } from "@harmony/ui/components/button";
import { Spinner } from "@harmony/ui/components/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import type { ExplorerBaseId } from "@/data/bases";
import type { Rule } from "@/data/filter";
import type { ViewState } from "@/widgets/base/view";

import { albumsRule, itemRule } from "@/data/items";
import { DetailNested, formatTrail, useDetail, type Detail } from "@/features/detail-panel";
import { Empty } from "@/shared/primitives/empty";
import { Media } from "@/shared/primitives/media";
import { Meta } from "@/shared/primitives/meta";
import { Pane } from "@/shared/primitives/pane";
import { usePeriod } from "@/shared/scope";
import { BaseView } from "@/widgets/base/base-view";

import { AlbumTracks } from "./album-tracks";
import { detailQueries } from "./api";
import { Catalogue, Mix } from "./catalogue";
import { Habits } from "./habits";
import { History } from "./history";
import { Overview } from "./overview";
import { Plays } from "./plays";

const Scroll = ({ value, children }: { value: string; children: ReactNode }) => (
  <TabsContent value={value} className="flex min-h-0 flex-col">
    <Pane.Body className="flex flex-col gap-3 px-4 pt-3 pb-12">{children}</Pane.Body>
  </TabsContent>
);

const List = ({ base, fixed }: { base: ExplorerBaseId; fixed: Rule[] }) => {
  const [state, setState] = useState<ViewState>({ base });
  return (
    <BaseView
      state={state}
      onChange={(patch) => setState((prev) => ({ ...prev, ...patch }))}
      fixed={fixed}
    />
  );
};

const TABS = {
  artist: ["overview", "history", "habits", "catalogue", "tracks", "albums", "plays"],
  album: ["overview", "history", "habits", "tracks", "plays"],
  track: ["overview", "history", "habits", "plays"],
  genre: ["overview", "history", "habits", "mix", "artists", "tracks", "albums", "plays"],
} as const;

type DetailViewProps = { item: Detail; tab: string; onTab: (tab: string) => void };

const DetailView = ({ item, tab, onTab }: DetailViewProps) => {
  const { packageId = "" } = useParams({ strict: false });
  const { trail, open, back, close } = useDetail();
  const period = usePeriod();
  const { data: info, isLoading } = useQuery(detailQueries.info(item));
  const rule = itemRule(item);
  const part = info ? { item, info, filter: { ...period, rules: [rule] } } : null;

  return (
    <Tabs
      value={TABS[item.kind].find((value) => value === tab) ?? "overview"}
      onValueChange={(value) => onTab(String(value))}
      className="h-full min-h-0 gap-0"
    >
      <header className="flex shrink-0 flex-col gap-2 border-b border-border px-4 pt-2 pb-1">
        <div className="flex items-center gap-1">
          {trail.length > 1 ? (
            <Button variant="ghost" size="icon" className="-ml-2" onClick={back}>
              <Icon icon={ArrowLeft01Icon} />
              <span className="sr-only">Back</span>
            </Button>
          ) : null}
          <span className="text-xs text-muted-foreground capitalize">
            {info?.type ?? item.kind}
          </span>
          {item.kind === "track" ? null : (
            <Link
              to="/app/$packageId/explorer"
              params={{ packageId }}
              search={{
                base: "tracks",
                rules: [{ ...rule, label: info?.name }],
                detail: formatTrail(trail),
              }}
              className={buttonVariants({ variant: "ghost", className: "ml-auto" })}
            >
              Open in Explorer
              <Icon icon={ArrowRight01Icon} />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={item.kind === "track" ? "-mr-2 ml-auto" : "-mr-2"}
            onClick={close}
          >
            <Icon icon={Cancel01Icon} />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        {info ? (
          <>
            <Media size="lg">
              <Media.Art
                src={info.image}
                alt={info.name}
                variant="glow"
                fallback={item.kind === "artist" ? "initials" : "icon"}
              />
              <Media.Body>
                <Media.Title className="line-clamp-2 whitespace-normal">{info.name}</Media.Title>
                <Media.Sub className="whitespace-normal">
                  <Meta>
                    {info.artists.map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => open({ kind: "artist", id: artist.id })}
                        className="cursor-pointer underline-offset-2 hover:text-foreground hover:underline"
                      >
                        {artist.name}
                      </button>
                    ))}
                    {info.album ? (
                      <button
                        type="button"
                        onClick={() => info.album && open({ kind: "album", id: info.album.id })}
                        className="cursor-pointer underline-offset-2 hover:text-foreground hover:underline"
                      >
                        {info.album.name}
                      </button>
                    ) : null}
                    {info.releaseDate ? <span>{info.releaseDate.slice(0, 4)}</span> : null}
                    {info.trackCount ? <span>{info.trackCount} tracks</span> : null}
                  </Meta>
                </Media.Sub>
              </Media.Body>
            </Media>
            <TabsList variant="line" className="-ml-1.5">
              {TABS[item.kind].map((value) => (
                <TabsTrigger key={value} value={value} className="capitalize">
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>
          </>
        ) : null}
      </header>

      {part ? (
        <>
          <Scroll value="overview">
            <Overview {...part} onTab={onTab} />
          </Scroll>
          <Scroll value="history">
            <History {...part} />
          </Scroll>
          <Scroll value="habits">
            <Habits {...part} />
          </Scroll>
          <Scroll value="catalogue">
            <Catalogue {...part} />
          </Scroll>
          <Scroll value="mix">
            <Mix {...part} />
          </Scroll>
          <Scroll value="tracks">
            {item.kind === "album" ? (
              <AlbumTracks albumId={item.id} />
            ) : (
              <List base="tracks" fixed={[rule]} />
            )}
          </Scroll>
          <Scroll value="artists">
            <List base="artists" fixed={[rule]} />
          </Scroll>
          <Scroll value="albums">
            <List base="albums" fixed={[albumsRule(item)]} />
          </Scroll>
          <TabsContent value="plays" className="flex min-h-0 flex-col">
            <Plays filter={part.filter} named={item.kind !== "track"} />
          </TabsContent>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          {isLoading ? <Spinner /> : <Empty>This {item.kind} is not in the package.</Empty>}
        </div>
      )}
    </Tabs>
  );
};

export const DetailPanel = ({ item }: { item?: Detail }) => {
  const detail = useDetail();
  const current = item ?? detail.current;
  const [tab, setTab] = useState("overview");
  if (!current) return null;

  return (
    <DetailNested value>
      <DetailView key={`${current.kind}-${current.id}`} item={current} tab={tab} onTab={setTab} />
    </DetailNested>
  );
};
