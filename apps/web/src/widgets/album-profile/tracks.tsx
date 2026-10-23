import { cn } from "@harmony/ui/lib/utils";

import type { AlbumTrack } from "@/data/albums/album";

import { Media } from "@/shared/primitives/media";
import { Meter } from "@/shared/primitives/meter";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Section } from "@/shared/primitives/section";
import { Table } from "@/shared/primitives/table";

type TracksProps = {
  tracks: AlbumTrack[];
  selectedId?: number;
  onOpen: (track: AlbumTrack) => void;
};

// Every known track of the album in album order, with a bar of the time listened. Tracks that were
// not played in the period stay in the list, dimmed.
export const AlbumTracks = ({ tracks, selectedId, onOpen }: TracksProps) => {
  const max = Math.max(1, ...tracks.map((track) => track.playtime));

  return (
    <Section>
      <Section.Title>Tracks</Section.Title>
      <Table variant="framed">
        <Table.Body>
          {tracks.map((track, index) => (
            <Table.Row
              key={track.id}
              selected={track.id === selectedId}
              onSelect={() => onOpen(track)}
              className={cn(track.streams === 0 && "opacity-50")}
            >
              <Table.Cell className="w-10 pl-4 text-center">
                <Rank n={index + 1} variant="plain" />
              </Table.Cell>
              <Table.Cell className="w-1/3 max-w-0">
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
              <Table.Cell className="w-20 text-right">
                <Num value={track.streams} />
              </Table.Cell>
              <Table.Cell className="w-20 pr-4 text-right">
                <Num value={track.playtime} kind="minutes" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Section>
  );
};
