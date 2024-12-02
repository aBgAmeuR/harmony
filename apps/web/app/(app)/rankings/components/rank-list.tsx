"use client";

import { useState } from "react";
import { Separator } from "@repo/ui/separator";
import { useQuery } from "@tanstack/react-query";

import { getRankingTracksAction } from "~/actions/get-ranking-tracks-action";
import { addMonths, MonthRangePicker } from "~/components/month-range-picker";

import { TrackCard } from "./track-card";

const useRankingTracks = (
  minDate: Date,
  maxDate: Date,
  initialData: InitialData[],
) => {
  return useQuery({
    queryKey: ["rankingTracks", minDate, maxDate],
    queryFn: async () => getRankingTracksAction(minDate, maxDate),
    initialData: initialData,
  });
};

type InitialData = {
  name: string;
  href: string;
  duration: number;
  artists: string;
  album: string | undefined;
  releaseDate: string;
  cover: string;
  totalPlayed: number;
  msPlayed: number;
};

type RankListProps = {
  minMaxDates: { minDate: Date; maxDate: Date };
  initialData: InitialData[];
};

export const RankList = ({ minMaxDates, initialData }: RankListProps) => {
  const [dates, setDates] = useState<{ start: Date; end: Date }>({
    start: minMaxDates.minDate,
    end: minMaxDates.maxDate,
  });
  const { data: tracks } = useRankingTracks(
    dates.start,
    addMonths(dates.end, 1),
    initialData,
  );

  return (
    <>
      <MonthRangePicker
        selectedMonthRange={dates}
        onMonthRangeSelect={setDates}
        minDate={minMaxDates.minDate}
        maxDate={minMaxDates.maxDate}
      />
      <div className="flex flex-col">
        {tracks?.map((track, index) => (
          <div key={track.href}>
            <TrackCard track={track} rank={index + 1} />
            {index < tracks.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </>
  );
};
