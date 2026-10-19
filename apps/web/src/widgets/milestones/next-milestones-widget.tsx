import { useQuery } from "@tanstack/react-query";

import { Empty } from "@/shared/primitives/empty";
import { Meter } from "@/shared/primitives/meter";
import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { formatBarCurrent, formatCount, nextMilestoneCopy } from "./format";

export const NextMilestonesWidget = () => {
  const filter = useScope();
  const { data = [] } = useQuery(milestoneQueries.nextMilestones.queryOptions(filter));
  const upcoming = data.filter((bar) => !bar.reached);

  return (
    <Section aria-labelledby="next-milestones">
      <Section.Title id="next-milestones">Next Milestones</Section.Title>
      {upcoming.length === 0 ? (
        <Empty className="items-start py-0">You have passed every listed mark.</Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {upcoming.map((bar) => {
            const { remaining, target } = nextMilestoneCopy(bar);
            const label = `${bar.label}, ${remaining} left before ${target}`;
            return (
              <div key={bar.id} className="min-w-0 space-y-1.5">
                <p className="text-sm text-pretty">
                  <span className="font-semibold text-primary">{remaining}</span>
                  {` left before `}
                  <span>{target}</span>
                </p>
                <Meter value={bar.percent} size="sm" label={label} />
                <p className="text-end text-[10px] text-muted-foreground">
                  {formatBarCurrent(bar)} / {formatCount(bar.target)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
};
