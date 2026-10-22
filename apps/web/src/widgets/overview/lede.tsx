import { Skeleton } from "@harmony/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";

import { Lede } from "@/shared/primitives/lede";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { delta, periodNames, periodWord, rangeLabel, shortDate } from "./format";
import { useRanges } from "./use-range";

// "512 h of music, 18% more than 2023.", or the period alone when there is nothing to compare to.
const headline = (minutes: number, previous: number, against: string, period: string): string => {
  const time = format.as(minutes, "minutes");
  const change = delta(minutes, previous);
  if (change === null) return `${time} of music ${period}.`;

  const pct = Math.round(Math.abs(change) * 100);
  if (pct === 0) return `${time} of music, about the same as ${against}.`;
  return `${time} of music, ${pct}% ${change > 0 ? "more" : "less"} than ${against}.`;
};

export const OverviewLede = () => {
  const { range, full } = useRanges();
  const { data: kpis } = useQuery(overviewQueries.kpis.queryOptions(range, full));
  const { data: highlights } = useQuery(overviewQueries.highlights.queryOptions(range));
  const { data: artists = [] } = useQuery(overviewQueries.topArtists.queryOptions(range));
  const { data: tracks = [] } = useQuery(overviewQueries.topTracks.queryOptions(range));

  if (!kpis) {
    return (
      <Lede>
        <Lede.Kicker>
          <Skeleton className="h-4 w-28" />
        </Lede.Kicker>
        <Lede.Pending />
      </Lede>
    );
  }

  // The chart below already says the period is empty.
  const { current, previous } = kpis;
  if (current.totals.streams === 0) return null;

  const artist = artists[0];
  const track = tracks[0];
  const peak = highlights?.peakDay;
  const against = periodNames(full).previous;

  return (
    <Lede>
      <Lede.Kicker className="tabular-nums">{rangeLabel(current.from, current.to)}</Lede.Kicker>
      <Lede.Title>
        {headline(
          current.totals.minutes,
          previous.totals.minutes,
          against,
          periodWord(full.from, full.to),
        )}
      </Lede.Title>
      <Lede.Text>
        {artist && track ? (
          <>
            <Lede.Em>{artist.name}</Lede.Em> led the way, and <Lede.Em>{track.name}</Lede.Em> was
            your top track.{" "}
          </>
        ) : null}
        {peak ? (
          <>
            Your biggest day was <Lede.Em>{shortDate(peak.date)}</Lede.Em>, with{" "}
            <Lede.Em>{format.as(peak.minutes, "minutes")}</Lede.Em> of music.
          </>
        ) : null}
      </Lede.Text>
    </Lede>
  );
};
