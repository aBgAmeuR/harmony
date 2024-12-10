"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Card } from "@repo/ui/card";
import { NumberFlow } from "@repo/ui/number";
import { Progress } from "@repo/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, FastForward, Users } from "lucide-react";

import { getNumbersStatsAction } from "~/actions/get-numbers-stats-actions";
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
              <NumberFlow value={msToHours(data.listeningTime).toFixed(2)} />{" "}
              hours
            </h2>
          </div>
          <Clock className="size-8 opacity-75" />
        </div>
        <p className="mt-4 text-sm opacity-75">
          That's about{" "}
          <NumberFlow value={Math.round(msToHours(data.listeningTime) / 24)} />{" "}
          days of non-stop music!
        </p>
      </Card>

      {/* Total Plays and Unique Tracks */}
      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Plays</p>
            <h3 className="text-2xl font-semibold">{data.totalPlays}</h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Tracks</p>
            <h3 className="text-2xl font-semibold">4,395</h3>
          </div>
        </div>
        <Progress value={18} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          18% of your plays were unique tracks
        </p>
      </Card>

      {/* Different Artists */}
      <Card className="p-6 flex items-center space-x-4">
        <Users className="size-12 text-indigo-500" />
        <div>
          <p className="text-sm text-muted-foreground">Different Artists</p>
          <h3 className="text-3xl font-bold">1,431</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Explored in your musical journey
          </p>
        </div>
      </Card>

      {/* First Track */}
      <Card className="p-6">
        <h3 className="font-semibold mb-2">First Track of the Year</h3>
        <div className="flex items-center space-x-4">
          <Avatar className="size-16">
            <AvatarImage
              src="https://i.scdn.co/image/ab67616d0000b27398ea0e689c91f8fea726d9bb"
              alt="Control by Playboi Carti"
            />
            <AvatarFallback>PC</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Control</p>
            <p className="text-sm text-muted-foreground">Playboi Carti</p>
            <p className="text-xs text-muted-foreground mt-1">
              Played on Jan 1, 2024 at 00:28
            </p>
          </div>
        </div>
      </Card>

      {/* Most Played Day */}
      <Card className="p-6 bg-green-100 dark:bg-green-900">
        <Calendar className="size-8 mb-2 text-green-600 dark:text-green-400" />
        <h3 className="font-semibold">Most Active Day</h3>
        <p className="text-2xl font-bold mt-1">April 28, 2024</p>
        <p className="text-sm text-muted-foreground mt-1">
          You played 231 tracks
        </p>
      </Card>

      {/* Online Track Percent */}
      <Card className="p-6 flex flex-col justify-between h-full">
        <div>
          <h3 className="font-semibold mb-2">Online Listening</h3>
          <p className="text-4xl font-bold">
            98<span className="text-2xl">%</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          You mostly listen to music while connected to the internet
        </p>
      </Card>

      {/* Most Skipped Track */}
      <Card className="p-6 bg-red-100 dark:bg-red-900">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">Most Skipped Track</h3>
          <FastForward className="size-5 text-red-500 dark:text-red-400" />
        </div>
        <div className="flex items-center space-x-3">
          <Avatar className="size-12">
            <AvatarImage
              src="https://i.scdn.co/image/ab67616d0000b273ca15942c726ec9c39796435e"
              alt="ALL RED by Playboi Carti"
            />
            <AvatarFallback>PC</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">ALL RED</p>
            <p className="text-sm text-muted-foreground">Playboi Carti</p>
          </div>
        </div>
        <Badge className="mt-3" variant="outline">
          Skipped 29 times
        </Badge>
      </Card>
    </div>
  );
};
