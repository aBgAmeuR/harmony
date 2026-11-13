import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { useDetail } from "@/features/detail-panel";
import { format } from "@/shared/lib/format";
import { Media } from "@/shared/primitives/media";
import { Meter } from "@/shared/primitives/meter";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Table } from "@/shared/primitives/table";
import { usePeriod } from "@/shared/scope";

import { detailQueries } from "./api";
import { Foot } from "./kit";

export const AlbumFoot = ({ albumId }: { albumId: number }) => {
  const range = usePeriod();
  const { data: tracks = [] } = useQuery(detailQueries.albumTracks({ albumId, range }));
  const { data: inOrder } = useQuery(detailQueries.inOrder({ albumId, range }));
  const played = tracks.filter((track) => track.streams > 0);

  return (
    <Foot>
      <span>
        <b>{played.length}</b> of {tracks.length} played
      </span>
      <span>
        <b>{inOrder === undefined ? "-" : format.as(inOrder, "percent")}</b> played in order
      </span>
      <span>
        <b>{format.count(played.reduce((sum, track) => sum + track.streams, 0))}</b> streams
      </span>
    </Foot>
  );
};

export const AlbumTracks = ({ albumId }: { albumId: number }) => {
  const range = usePeriod();
  const { data: tracks = [] } = useQuery(detailQueries.albumTracks({ albumId, range }));
  const { open } = useDetail();
  const max = Math.max(1, ...tracks.map((track) => track.playtime));

  return (
    <Table>
      <Table.Body>
        {tracks.map((track, index) => (
          <Table.Row
            key={track.id}
            onSelect={() => open({ kind: "track", id: track.id })}
            className={cn(track.streams === 0 && "opacity-50")}
          >
            <Table.Cell className="w-8 text-center">
              <Rank n={index + 1} variant="plain" />
            </Table.Cell>
            <Table.Cell className="w-1/2 max-w-0">
              <Media>
                <Media.Body>
                  <Media.Title>{track.name}</Media.Title>
                  <Media.Sub>{track.description}</Media.Sub>
                </Media.Body>
              </Media>
            </Table.Cell>
            <Table.Cell>
              <Meter value={track.playtime} max={max} />
            </Table.Cell>
            <Table.Cell className="w-12 text-right">
              <Num value={track.streams} />
            </Table.Cell>
            <Table.Cell className="w-20 text-right">
              <Num value={track.playtime} kind="minutes" />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
