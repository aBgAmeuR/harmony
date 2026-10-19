import type { RankRow } from "@/data/rank";

import { Empty } from "@/shared/primitives/empty";
import { Media } from "@/shared/primitives/media";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Section } from "@/shared/primitives/section";
import { Table } from "@/shared/primitives/table";

type RankingProps = {
  title: string;
  rows: RankRow[];
  selectedId?: number;
  onOpen: (row: RankRow) => void;
};

// A short top list, rows lead to the track sheet or the album page.
export const Ranking = ({ title, rows, selectedId, onOpen }: RankingProps) => (
  <Section>
    <Section.Title>{title}</Section.Title>
    {rows.length === 0 ? (
      <Empty variant="framed">Nothing played in this period.</Empty>
    ) : (
      <Table variant="framed">
        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row key={row.id} selected={row.id === selectedId} onSelect={() => onOpen(row)}>
              <Table.Cell className="w-10 pl-4 text-center">
                <Rank n={index + 1} />
              </Table.Cell>
              <Table.Cell className="max-w-0">
                <Media>
                  <Media.Art src={row.image} alt={row.name} />
                  <Media.Body>
                    <Media.Title>{row.name}</Media.Title>
                    <Media.Sub>{row.description}</Media.Sub>
                  </Media.Body>
                </Media>
              </Table.Cell>
              <Table.Cell className="w-20 text-right">
                <Num value={row.streams} />
              </Table.Cell>
              <Table.Cell className="w-24 pr-4 text-right">
                <Num value={row.playtime} kind="minutes" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )}
  </Section>
);
