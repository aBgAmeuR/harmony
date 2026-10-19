import { Card } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";

import { albumQueries } from "@/entities/album";
import { DateRangeFilter } from "@/features/filter-period";
import { measure } from "@/shared/lib/measure";
import { Crumbs } from "@/shared/primitives/crumbs";
import { Empty } from "@/shared/primitives/empty";
import { Grid } from "@/shared/primitives/grid";
import { Media } from "@/shared/primitives/media";
import { Meta } from "@/shared/primitives/meta";
import { Pane } from "@/shared/primitives/pane";
import { Stat } from "@/shared/primitives/stat";
import { Toolbar } from "@/shared/primitives/toolbar";
import { usePeriod } from "@/shared/scope";
import { AlbumTracks } from "@/widgets/album-profile/tracks";
import { TrackSheet } from "@/widgets/track-details/track-sheet";
import { useTrackPanel } from "@/widgets/track-details/use-track-panel";

const FROM = "/app/$packageId/albums/$albumId";

export const AlbumPage = () => {
  const { packageId, albumId: raw } = useParams({ from: FROM });
  const albumId = Number(raw);
  const { from, to } = usePeriod();
  const { trackId, setTrack } = useTrackPanel();

  const { data: album, isLoading } = useQuery(albumQueries.get.queryOptions(albumId));
  const { data: kpis } = useQuery(albumQueries.kpis.queryOptions({ albumId, from, to }));
  const { data: tracks = [] } = useQuery(albumQueries.tracks.queryOptions({ albumId, from, to }));

  const year = album?.releaseDate?.slice(0, 4);

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
                search={{ tab: "albums" }}
              />
            }
          >
            Albums
          </Crumbs.Item>
          <Crumbs.Here>{album?.name ?? "Album"}</Crumbs.Here>
        </Crumbs>
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="md" className="flex flex-col gap-4">
        {!isLoading && !album ? (
          <Empty className="py-8">Album not found.</Empty>
        ) : (
          <>
            <Media size="xl">
              <Media.Art src={album?.image} alt={album?.name ?? ""} variant="glow" />
              <Media.Body className="gap-1">
                {album?.type ? (
                  <span className="text-xs text-muted-foreground capitalize">{album.type}</span>
                ) : null}
                <Media.Title>{album?.name}</Media.Title>
                {album ? (
                  <Media.Sub className="whitespace-normal">
                    <Meta>
                      <span>
                        {album.artists.map((artist, index) => (
                          <span key={artist.id}>
                            {index > 0 ? ", " : null}
                            <Link
                              to="/app/$packageId/artists/$artistId"
                              params={{ packageId, artistId: String(artist.id) }}
                              className="text-foreground underline-offset-2 hover:underline"
                            >
                              {artist.name}
                            </Link>
                          </span>
                        ))}
                      </span>
                      {year ? <span>{year}</span> : null}
                      <span>{album.trackCount} tracks</span>
                    </Meta>
                  </Media.Sub>
                ) : null}
              </Media.Body>
            </Media>
            <Grid cols={4}>
              <Card size="xs">
                <Stat>
                  <Stat.Label>{measure.playtime.label}</Stat.Label>
                  <Stat.Value value={kpis?.playtime} kind="minutes" />
                </Stat>
              </Card>
              <Card size="xs">
                <Stat>
                  <Stat.Label>{measure.streams.label}</Stat.Label>
                  <Stat.Value value={kpis?.streams} />
                </Stat>
              </Card>
              <Card size="xs">
                <Stat>
                  <Stat.Label>{measure.tracks.label}</Stat.Label>
                  <Stat.Value>
                    {kpis?.tracksPlayed ?? 0} / {album?.trackCount ?? 0}
                  </Stat.Value>
                </Stat>
              </Card>
              <Card size="xs">
                <Stat>
                  <Stat.Label>{measure.skipRate.label}</Stat.Label>
                  <Stat.Value value={kpis?.skipRate} kind="percent" />
                </Stat>
              </Card>
            </Grid>
            <AlbumTracks
              tracks={tracks}
              selectedId={trackId}
              onOpen={(track) => setTrack(track.id)}
            />
          </>
        )}
      </Pane.Body>
      <TrackSheet />
    </Pane>
  );
};
