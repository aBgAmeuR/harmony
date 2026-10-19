import { useQuery } from "@tanstack/react-query";

import { Empty } from "@/shared/primitives/empty";
import { Media } from "@/shared/primitives/media";
import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { formatMilestoneDate } from "./format";

export const FirstsWidget = () => {
  const filter = useScope();
  const { data = [], isPending } = useQuery(milestoneQueries.firsts.queryOptions(filter));

  return (
    <Section aria-labelledby="discoveries-that-stayed">
      <header>
        <Section.Title id="discoveries-that-stayed">Discoveries that stayed</Section.Title>
        <p className="text-xs text-pretty text-muted-foreground">
          Artists you first heard in this range, now in your top 50.
        </p>
      </header>
      {!isPending && data.length === 0 ? (
        <Empty className="items-start py-0">
          No top-50 artists were first heard in this range.
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((row) => (
            <li key={row.id}>
              <Media>
                <Media.Art src={row.image} alt={row.name} />
                <Media.Body>
                  <Media.Title className="font-normal">{row.name}</Media.Title>
                  <Media.Sub>{formatMilestoneDate(row.date)}</Media.Sub>
                </Media.Body>
                <Media.End className="text-sm font-medium text-primary">#{row.laterRank}</Media.End>
              </Media>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};
