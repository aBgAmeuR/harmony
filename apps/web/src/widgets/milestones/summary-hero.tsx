import { useQuery } from "@tanstack/react-query";

import { ArtistsSelect } from "@/features/pick-artist";
import { format } from "@/shared/lib/format";
import { Lede } from "@/shared/primitives/lede";
import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { heroHeadline, nextMilestoneCopy } from "./format";

export const SummaryHero = () => {
  const filter = useScope();
  const { data } = useQuery(milestoneQueries.summary(filter));
  const { data: bars = [] } = useQuery(milestoneQueries.next(filter));

  // The mark closest to being reached.
  const next = bars.filter((bar) => !bar.reached).sort((a, b) => b.progress - a.progress)[0];
  const copy = next ? nextMilestoneCopy(next) : null;

  return (
    <Lede>
      <Lede.Kicker>
        <ArtistsSelect />
        {data ? (
          <span>
            {data.rangeStart ? `Since ${format.longDate(data.rangeStart)}` : "Since the first play"}
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
