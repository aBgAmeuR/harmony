"use client";

import { Separator } from "@repo/ui/separator";
import { useQuery } from "@tanstack/react-query";

import { getRankingAlbumsAction } from "~/actions/get-ranking-albums-action";
import { getRankingArtistsAction } from "~/actions/get-ranking-artists-action";
import { getRankingTracksAction } from "~/actions/get-ranking-tracks-action";
import { ListSkeleton } from "~/components/list-skeleton";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";

import { ErrorRankList } from "./error-rank-list";
import { RankingCard } from "./ranking-card";

const actions = {
  tracks: getRankingTracksAction,
  artists: getRankingArtistsAction,
  albums: getRankingAlbumsAction,
} as const;

type RankingType = keyof typeof actions;
type InitalData = Awaited<ReturnType<(typeof actions)[keyof typeof actions]>>;

type RankListProps = {
  type: RankingType;
  initialData?: InitalData;
};

const useRankingData = (
  type: RankingType,
  minDate: Date,
  maxDate: Date,
  initialData: InitalData = [],
) => {
  return useQuery({
    queryKey: [
      `ranking${type.charAt(0).toUpperCase() + type.slice(1)}`,
      minDate,
      maxDate,
    ],
    queryFn: async () => actions[type](minDate, maxDate),
    initialData: initialData,
  });
};

export const RankList = ({ type, initialData }: RankListProps) => {
  const dates = useRankingTimeRange((state) => state.dates);
  const {
    data: items,
    isLoading,
    isError,
  } = useRankingData(
    type,
    new Date(dates.start),
    addMonths(new Date(dates.end), 1),
    initialData,
  );

  if (isLoading) return <ListSkeleton />;
  if (isError) return <ErrorRankList />;

  return (
    <div className="flex flex-col">
      {items?.map((item, index: number) => (
        <div key={item.href}>
          <RankingCard
            type={type.slice(0, -1) as "track" | "artist" | "album"}
            item={item}
            rank={index + 1}
          />
          {index < items.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
