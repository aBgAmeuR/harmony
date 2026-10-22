import { useQuery } from "@tanstack/react-query";

import { ArtistsSelect } from "@/features/pick-artist";
import { Lede } from "@/shared/primitives/lede";
import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { formatLongDate, heroHeadline, nextMilestoneCopy } from "./format";

export const SummaryHero = () => {
  const filter = useScope();
  const { data } = useQuery(milestoneQueries.summary.queryOptions(filter));
  const { data: bars = [] } = useQuery(milestoneQueries.nextMilestones.queryOptions(filter));

  // The mark closest to being reached.
  const next = bars.filter((bar) => !bar.reached).sort((a, b) => b.percent - a.percent)[0];
  const copy = next ? nextMilestoneCopy(next) : null;

  return (
    <Lede>
      <Lede.Kicker>
        <ArtistsSelect />
        {data ? (
          <span>
            {data.rangeStart ? `Since ${formatLongDate(data.rangeStart)}` : "Since the first play"}
          </span>
        ) : null}
      </Lede.Kicker>
      {data ? (
        <>
          <Lede.Title>{heroHeadline(data.listeningDays, data.streams)}</Lede.Title>
          {copy ? (
            <Lede.Text>
              Next up: <Lede.Em>{copy.remaining}</Lede.Em> left before{" "}
              <Lede.Em>{copy.target}</Lede.Em>.
            </Lede.Text>
          ) : null}
        </>
      ) : (
        <Lede.Pending />
      )}
    </Lede>
  );
};
