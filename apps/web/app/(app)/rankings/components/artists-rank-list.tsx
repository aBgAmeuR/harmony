"use client";

import { Separator } from "@repo/ui/separator";
import { useQuery } from "@tanstack/react-query";

import { getRankingArtistsAction } from "~/actions/get-ranking-artists-action";
import { addMonths, MonthRangePicker } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";

import { ArtistCard } from "./artist-card";

const useRankingArtists = (minDate: Date, maxDate: Date) => {
  return useQuery({
    queryKey: ["rankingTracks", minDate, maxDate],
    queryFn: async () => getRankingArtistsAction(minDate, maxDate),
  });
};

type ArtistsRankListProps = {
  minMaxDates: { minDate: Date; maxDate: Date };
};

export const ArtistsRankList = ({ minMaxDates }: ArtistsRankListProps) => {
  const { dates, setDates } = useRankingTimeRange();

  const { data: artists } = useRankingArtists(
    new Date(dates.start),
    addMonths(new Date(dates.end), 1),
  );

  return (
    <>
      <MonthRangePicker
        selectedMonthRange={{
          start: new Date(dates.start),
          end: new Date(dates.end),
        }}
        onMonthRangeSelect={setDates}
        minDate={minMaxDates.minDate}
        maxDate={minMaxDates.maxDate}
      />
      <div className="flex flex-col">
        {artists?.map((artist, index) => (
          <div key={artist.href}>
            <ArtistCard artist={artist} rank={index + 1} />
            {index < artists.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </>
  );
};
