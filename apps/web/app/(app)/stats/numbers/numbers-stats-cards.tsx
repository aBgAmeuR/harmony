"use client";

import { Badge } from "@repo/ui/badge";
import { Card } from "@repo/ui/card";
import { NumberFlow, NumbersFlowDate } from "@repo/ui/number";
import { Progress } from "@repo/ui/progress";
import { Skeleton } from "@repo/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, FastForward, Users } from "lucide-react";

import { getNumbersStatsAction } from "~/actions/get-numbers-stats-actions";
import {
  ItemCard,
  ItemCardContent,
  ItemCardImage,
  ItemCardSubtitle,
  ItemCardTitle,
} from "~/components/item-card";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";

type InitialData = Awaited<ReturnType<typeof getNumbersStatsAction>>;

type NumbersStatsCardsProps = {
  initialData: InitialData;
};

const msToHours = (ms: number) => ms / 1000 / 60 / 60;

const useNumbersStats = (
  minDate: Date,
  maxDate: Date,
  initialData: InitialData,
) =>
  useQuery({
    queryKey: ["numbersStats", minDate, maxDate],
    queryFn: async () => await getNumbersStatsAction(minDate, maxDate),
    initialData,
  });

export const NumbersStatsCards = ({ initialData }: NumbersStatsCardsProps) => {
  const dates = useRankingTimeRange((state) => state.dates);
  const { data, isLoading, isError } = useNumbersStats(
    new Date(dates.start),
    addMonths(new Date(dates.end), 1),
    initialData,
  );

  if (isLoading) return null;
  if (isError || !data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Listening Time */}
      <Card className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-75">Total Listening Time</p>
            <h2 className="text-4xl font-bold mt-2">
              <NumberFlow
                value={msToHours(data.listeningTime).toFixed(2)}
                suffix=" hours"
              />
            </h2>
          </div>
          <Clock className="size-8 opacity-75" />
        </div>
        <p className="mt-4 text-sm opacity-75">
          <NumberFlow
            value={Math.round(msToHours(data.listeningTime) / 24)}
            prefix="That's about "
            suffix=" days of non-stop music!"
          />
        </p>
      </Card>

      {/* Total Plays and Unique Tracks */}
      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Plays</p>
            <h3 className="text-2xl font-semibold">
              <NumberFlow
                value={data.totalPlays}
                format={{ notation: "standard" }}
                locales="en-US"
              />
            </h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Tracks</p>
            <h3 className="text-2xl font-semibold">
              <NumberFlow
                value={data.uniqueTracks}
                format={{ notation: "standard" }}
                locales="en-US"
              />
            </h3>
          </div>
        </div>
        <Progress
          value={(data.uniqueTracks / data.totalPlays) * 100}
          className="h-2 [&>div]:duration-500 [&>div]:ease-in-out"
        />
        <p className="text-sm text-muted-foreground mt-2">
          <NumberFlow
            value={
              data.uniqueTracks && data.totalPlays
                ? data.uniqueTracks / data.totalPlays
                : 0
            }
            format={{ style: "percent" }}
            locales="en-US"
            suffix=" of your plays were unique tracks"
          />
        </p>
      </Card>

      {/* Different Artists */}
      <Card className="p-6 flex items-center space-x-4">
        <Users className="size-12 text-indigo-500" />
        <div>
          <p className="text-sm text-muted-foreground">Different Artists</p>
          <h3 className="text-3xl font-bold">
            <NumberFlow
              value={data.differentArtists}
              format={{ notation: "standard" }}
              locales="en-US"
            />
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Explored in your musical journey
          </p>
        </div>
      </Card>

      {/* First Track */}
      <Card className="p-6">
        <h3 className="font-semibold mb-2">First Track of the Year</h3>
        <div>
          <ItemCard className="py-0">
            <ItemCardImage
              src={data.firstTrack.cover}
              alt={data.firstTrack.name}
            />
            <ItemCardContent>
              <ItemCardTitle>{data.firstTrack.name}</ItemCardTitle>
              <ItemCardSubtitle>{data.firstTrack.artists}</ItemCardSubtitle>
            </ItemCardContent>
          </ItemCard>
          <p className="mt-2 text-sm text-muted-foreground">
            Played on{" "}
            {data.firstTrack.timestamp ? (
              <NumbersFlowDate value={data.firstTrack.timestamp} showTime />
            ) : (
              "an unknown date"
            )}
          </p>
        </div>
      </Card>

      {/* Most Played Day */}
      <Card className="p-6 bg-green-100 dark:bg-green-900">
        <Calendar className="size-8 mb-2 text-green-600 dark:text-green-400" />
        <h3 className="font-semibold">Most Active Day</h3>
        <p className="text-2xl font-bold mt-1">
          {data.mostActiveDay.day ? (
            <NumbersFlowDate value={new Date(data.mostActiveDay.day)} />
          ) : (
            "No data available"
          )}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <NumberFlow
            value={data.mostActiveDay.totalPlayed}
            format={{ notation: "standard" }}
            locales="en-US"
            suffix=" tracks for "
            prefix="You played "
          />
          <NumberFlow
            value={msToHours(data.mostActiveDay.totalTime).toFixed(2)}
            suffix=" hours"
          />
        </p>
      </Card>

      {/* Online Track Percent */}
      <Card className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Online Listening</p>
            <h3 className="text-4xl font-semibold">
              <NumberFlow
                value={data.onlineTrackPercent / 100}
                format={{ style: "percent" }}
                locales="en-US"
              />
            </h3>
          </div>
        </div>
        <Progress
          value={data.onlineTrackPercent}
          className="h-2 [&>div]:duration-500 [&>div]:ease-in-out"
        />
        <p className="text-sm text-muted-foreground mt-2">
          {data.onlineTrackPercent > 50
            ? "You mostly listen to music while connected to the internet"
            : "You mostly listen to music while offline"}
        </p>
      </Card>

      {/* Most Skipped Track */}
      <Card className="p-6 bg-red-100 dark:bg-red-900">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">Most Forwarded Track</h3>
          <FastForward className="size-5 text-red-500 dark:text-red-400" />
        </div>
        <div className="flex items-center space-x-3">
          <ItemCard className="py-0">
            <ItemCardImage
              src={data.mostFwdbtnTrack.cover || ""}
              alt={data.mostFwdbtnTrack.name || ""}
            />
            <ItemCardContent>
              <ItemCardTitle>{data.mostFwdbtnTrack.name}</ItemCardTitle>
              <ItemCardSubtitle>
                {data.mostFwdbtnTrack.artists}
              </ItemCardSubtitle>
            </ItemCardContent>
          </ItemCard>
        </div>
        <Badge className="mt-3" variant="outline">
          <NumberFlow
            value={data.mostFwdbtnTrack.totalPlayed}
            format={{ notation: "standard" }}
            locales="en-US"
            prefix="Forwarded "
            suffix=" times"
          />
        </Badge>
      </Card>
    </div>
  );
};

export const NumbersStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-75">Total Listening Time</p>
            <h2 className="text-4xl font-bold mt-2">
              <Skeleton className="w-40 h-10 mt-4" />
            </h2>
          </div>
          <Clock className="size-8 opacity-75" />
        </div>
        <p className="mt-4 text-sm opacity-75">
          <Skeleton className="w-56 h-5 mt-6" />
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Plays</p>
            <h3 className="text-2xl font-semibold">
              <Skeleton className="w-20 h-8 mt-1" />
            </h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Tracks</p>
            <h3 className="text-2xl font-semibold">
              <Skeleton className="w-20 h-8 mt-1" />
            </h3>
          </div>
        </div>
        <Progress className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          <Skeleton className="w-44 h-5 mt-2" />
        </p>
      </Card>

      <Card className="p-6 flex items-center space-x-4">
        <Users className="size-12 text-indigo-500" />
        <div>
          <p className="text-sm text-muted-foreground">Different Artists</p>
          <h3 className="text-3xl font-bold">
            <Skeleton className="w-20 h-7 mt-2" />
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            <Skeleton className="w-36 h-5 mt-4" />
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-2">First Track of the Year</h3>
        <div>
          <ItemCard className="py-0">
            <ItemCardImage src="" alt="" />
            <ItemCardContent>
              <ItemCardTitle>
                <Skeleton className="w-32 h-5 mt-1" />
              </ItemCardTitle>
              <ItemCardSubtitle>
                <Skeleton className="w-20 h-4 mt-1" />
              </ItemCardSubtitle>
            </ItemCardContent>
          </ItemCard>
          <p className="mt-2 text-sm text-muted-foreground">
            <Skeleton className="w-36 h-4 mt-1" />
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-green-100 dark:bg-green-900">
        <Calendar className="size-8 mb-2 text-green-600 dark:text-green-400" />
        <h3 className="font-semibold">Most Active Day</h3>
        <p className="text-2xl font-bold mt-1">
          <Skeleton className="w-44 h-8 mt-2" />
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <Skeleton className="w-52 h-5 mt-3" />
        </p>
      </Card>

      <Card className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Online Listening</p>
            <h3 className="text-4xl font-semibold">
              <Skeleton className="w-24 h-10 mt-3" />
            </h3>
          </div>
        </div>
        <Progress className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          <Skeleton className="w-64 h-5 mt-1" />
        </p>
      </Card>

      <Card className="p-6 bg-red-100 dark:bg-red-900">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">Most Forwarded Track</h3>
          <FastForward className="size-5 text-red-500 dark:text-red-400" />
        </div>
        <div className="flex items-center space-x-3">
          <ItemCard className="py-0">
            <ItemCardImage src="" alt="" />
            <ItemCardContent>
              <ItemCardTitle>
                <Skeleton className="w-32 h-5 mt-1" />
              </ItemCardTitle>
              <ItemCardSubtitle>
                <Skeleton className="w-20 h-4 mt-1" />
              </ItemCardSubtitle>
            </ItemCardContent>
          </ItemCard>
        </div>
        <Skeleton className="w-32 h-6 mt-3" />
      </Card>
    </div>
  );
};
