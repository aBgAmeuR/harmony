import { Card } from "@harmony/ui/components/card";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";

import { Art } from "@/shared/primitives/art";
import { Grid } from "@/shared/primitives/grid";
import { Meta } from "@/shared/primitives/meta";
import { Num } from "@/shared/primitives/num";
import { Stat } from "@/shared/primitives/stat";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { shortDate } from "./format";
import { useRanges } from "./use-range";

export const HighlightsWidget = () => {
  const { range } = useRanges();
  const { data } = useQuery(overviewQueries.highlights.queryOptions(range));

  if (!data) {
    return (
      <Grid cols={4}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-22 rounded-lg" />
        ))}
      </Grid>
    );
  }

  const { peakDay, streak, newArtists, replayed } = data;

  return (
    <Grid cols={4}>
      <Card size="xs">
        <Stat>
          <Stat.Label>Peak day</Stat.Label>
          <Stat.Value>{peakDay ? shortDate(peakDay.date) : "-"}</Stat.Value>
          {peakDay ? (
            <Stat.Hint>
              <Meta>
                <Num value={peakDay.minutes} kind="minutes" size="xs" />
                <span className="tabular-nums">{format.count(peakDay.streams)} streams</span>
              </Meta>
            </Stat.Hint>
          ) : null}
        </Stat>
      </Card>

      <Card size="xs">
        <Stat>
          <Stat.Label>Longest streak</Stat.Label>
          <Stat.Value>{format.count(streak.days)} days</Stat.Value>
          {streak.start && streak.end ? (
            <Stat.Hint className="tabular-nums">
              {shortDate(streak.start)} - {shortDate(streak.end)}
            </Stat.Hint>
          ) : null}
        </Stat>
      </Card>

      <Card size="xs">
        <Stat>
          <Stat.Label>New artists</Stat.Label>
          <Stat.Value value={newArtists} />
          <Stat.Hint>
            {newArtists === null
              ? "Needs history before this period"
              : "First listened this period"}
          </Stat.Hint>
        </Stat>
      </Card>

      <Card size="xs">
        <Stat className="pr-18">
          <Stat.Label>Most replayed</Stat.Label>
          <Stat.Value className="truncate">{replayed?.name ?? "-"}</Stat.Value>
          {replayed ? (
            <>
              <Stat.Hint className="truncate">
                <Meta>
                  {replayed.description}
                  <span className="tabular-nums">{format.count(replayed.streams)} streams</span>
                </Meta>
              </Stat.Hint>
              <Stat.Aside>
                <Art src={replayed.image} alt={replayed.name} size="lg" fallback="initials" />
              </Stat.Aside>
            </>
          ) : null}
        </Stat>
      </Card>
    </Grid>
  );
};
