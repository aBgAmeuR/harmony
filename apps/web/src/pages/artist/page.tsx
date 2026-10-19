import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Card } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";

import { artistQueries } from "@/entities/artist";
import { DateRangeFilter } from "@/features/filter-period";
import { measure } from "@/shared/lib/measure";
import { Crumbs } from "@/shared/primitives/crumbs";
import { Empty } from "@/shared/primitives/empty";
import { Grid } from "@/shared/primitives/grid";
import { Media } from "@/shared/primitives/media";
import { Pane } from "@/shared/primitives/pane";
import { Stat } from "@/shared/primitives/stat";
import { Toolbar } from "@/shared/primitives/toolbar";
import { useArtistStore, usePeriod } from "@/shared/scope";
import { Monthly } from "@/widgets/artist-profile/monthly";
import { Ranking } from "@/widgets/artist-profile/ranking";
import { TrackSheet } from "@/widgets/track-details/track-sheet";
import { useTrackPanel } from "@/widgets/track-details/use-track-panel";

const FROM = "/app/$packageId/artists/$artistId";

const KPIS = ["playtime", "streams", "tracks", "skipRate"] as const;

export const ArtistPage = () => {
  const { packageId, artistId: raw } = useParams({ from: FROM });
  const artistId = Number(raw);
  const { from, to } = usePeriod();
  const navigate = useNavigate();
  const { trackId, setTrack } = useTrackPanel();

  const { data: artist, isLoading } = useQuery(artistQueries.get.queryOptions(artistId));
  const { data: kpis } = useQuery(artistQueries.kpis.queryOptions({ artistId, from, to }));
  const scope = { artistId, from, to };
  const { data: tracks = [] } = useQuery(artistQueries.tracks.queryOptions(scope));
  const { data: albums = [] } = useQuery(artistQueries.albums.queryOptions(scope));

  // Hands the artist over to the Explorer as its scope, the same as picking it in the menu.
  const exploreAll = () => {
    if (!artist) return;
    useArtistStore.getState().setArtist(artist);
    void navigate({
      to: "/app/$packageId/explorer",
      params: { packageId },
      search: { tab: "tracks" },
    });
  };

  return (
    <Pane>
      <Pane.Header>
        <Crumbs>
          <Crumbs.Item
            render={<Link to="/app/$packageId/explorer" params={{ packageId }} search={{}} />}
          >
            Explorer
          </Crumbs.Item>
          <Crumbs.Item
            render={
              <Link
                to="/app/$packageId/explorer"
                params={{ packageId }}
                search={{ tab: "artists" }}
              />
            }
          >
            Artists
          </Crumbs.Item>
          <Crumbs.Here>{artist?.name ?? "Artist"}</Crumbs.Here>
        </Crumbs>
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="md" className="flex flex-col gap-4">
        {!isLoading && !artist ? (
          <Empty className="py-8">Artist not found.</Empty>
        ) : (
          <>
            <Media size="xl">
              <Media.Art src={artist?.image} alt={artist?.name ?? ""} variant="glow" />
              <Media.Body>
                <Media.Title>{artist?.name}</Media.Title>
              </Media.Body>
              <Media.End>
                <Button variant="outline" onClick={exploreAll}>
                  Explore all
                  <Icon icon={ArrowRight01Icon} />
                </Button>
              </Media.End>
            </Media>
            <Grid cols={4}>
              {KPIS.map((key) => (
                <Card key={key} size="xs">
                  <Stat>
                    <Stat.Label>{measure[key].label}</Stat.Label>
                    <Stat.Value value={kpis?.[key]} kind={measure[key].kind} />
                  </Stat>
                </Card>
              ))}
            </Grid>
            <Monthly artistId={artistId} />
            <div className="grid gap-4 lg:grid-cols-2">
              <Ranking
                title="Top tracks"
                rows={tracks}
                selectedId={trackId}
                onOpen={(row) => setTrack(row.id)}
              />
              <Ranking
                title="Albums"
                rows={albums}
                onOpen={(row) =>
                  navigate({
                    to: "/app/$packageId/albums/$albumId",
                    params: { packageId, albumId: String(row.id) },
                  })
                }
              />
            </div>
          </>
        )}
      </Pane.Body>
      <TrackSheet />
    </Pane>
  );
};
