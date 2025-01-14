import { auth } from "@repo/auth";
import { Badge } from "@repo/ui/badge";
import { Card } from "@repo/ui/card";
import { NumberFlow, NumbersFlowDate } from "@repo/ui/number";
import { Progress } from "@repo/ui/progress";
import { Skeleton } from "@repo/ui/skeleton";
import { Calendar, Clock, FastForward, Users } from "lucide-react";

import { MusicItemCardContent } from "~/components/cards/music-item-card/content";
import { MusicItemCardImage } from "~/components/cards/music-item-card/image";
import {
  ProgressCard,
  ProgressCardHeader,
} from "~/components/cards/number-stat-card/progress-card";
import { isDemo } from "~/lib/utils-server";
import { getNumbersStats } from "~/services/numbers-stats";

const msToHours = (ms: number) => ms / 1000 / 60 / 60;

export const NumbersStatsCards = async () => {
  const session = await auth();
  const data = await getNumbersStats(session?.user.id, isDemo(session));
  if (!data) return null;

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
      <ProgressCard
        progress={(data.uniqueTracks / data.totalPlays) * 100}
        description={
          <NumberFlow
            value={data.uniqueTracks / data.totalPlays}
            format={{ style: "percent" }}
            locales="en-US"
            suffix=" of your plays were unique tracks"
          />
        }
      >
        <ProgressCardHeader label="Total Plays" value={data.totalPlays} />
        <ProgressCardHeader label="Unique Tracks" value={data.uniqueTracks} />
      </ProgressCard>

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
        <h3 className="font-semibold mb-2">First Track you played</h3>
        <div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <MusicItemCardImage
              src={data.firstTrack.cover}
              alt={data.firstTrack.name}
            />
            <MusicItemCardContent
              item={{
                href: data.firstTrack.href,
                name: data.firstTrack.name,
                artists: data.firstTrack.artists,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Played on{" "}
            {data.firstTrack.timestamp ? (
              <NumbersFlowDate value={data.firstTrack.timestamp} />
            ) : (
              "No data"
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
            "No data"
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
      <ProgressCard
        progress={data.onlineTrackPercent}
        description={
          data.onlineTrackPercent > 50
            ? "You mostly listen to music while connected to the internet"
            : "You mostly listen to music while offline"
        }
      >
        <ProgressCardHeader
          label="Online Listening"
          value={data.onlineTrackPercent / 100}
          percentage
        />
      </ProgressCard>

      {/* Most Skipped Track */}
      <Card className="p-6 bg-red-100 dark:bg-red-900">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">Most Forwarded Track</h3>
          <FastForward className="size-5 text-red-500 dark:text-red-400" />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <MusicItemCardImage
            src={data.mostFwdbtnTrack.cover}
            alt={data.mostFwdbtnTrack.name}
          />
          <MusicItemCardContent
            item={{
              href: data.mostFwdbtnTrack.href,
              name: data.mostFwdbtnTrack.name,
              artists: data.mostFwdbtnTrack.artists,
            }}
          />
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
            <Skeleton className="w-40 h-10 mt-4" />
          </div>
          <Clock className="size-8 opacity-75" />
        </div>
        <Skeleton className="w-56 h-5 mt-6" />
      </Card>

      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Plays</p>
            <Skeleton className="w-20 h-8 mt-1" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Tracks</p>
            <Skeleton className="w-20 h-8 mt-1" />
          </div>
        </div>
        <Progress className="h-2" />
        <Skeleton className="w-44 h-5 mt-2" />
      </Card>

      <Card className="p-6 flex items-center space-x-4">
        <Users className="size-12 text-indigo-500" />
        <div>
          <p className="text-sm text-muted-foreground">Different Artists</p>
          <Skeleton className="w-20 h-7 mt-2" />
          <Skeleton className="w-36 h-5 mt-4" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-2">First Track of the Year</h3>
        <div>
          <div className="flex items-center space-x-3">
            <MusicItemCardImage />
            <div className="space-y-1">
              <Skeleton className="w-32 h-5 mt-1" />
              <Skeleton className="w-20 h-4 mt-1" />
            </div>
          </div>
          <Skeleton className="w-36 h-4 mt-2" />
        </div>
      </Card>

      <Card className="p-6 bg-green-100 dark:bg-green-900">
        <Calendar className="size-8 mb-2 text-green-600 dark:text-green-400" />
        <h3 className="font-semibold">Most Active Day</h3>
        <Skeleton className="w-44 h-8 mt-2" />
        <Skeleton className="w-52 h-5 mt-3" />
      </Card>

      <Card className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Online Listening</p>
            <Skeleton className="w-24 h-10 mt-3" />
          </div>
        </div>
        <Progress className="h-2" />
        <Skeleton className="w-64 h-5 mt-1" />
      </Card>

      <Card className="p-6 bg-red-100 dark:bg-red-900">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">Most Forwarded Track</h3>
          <FastForward className="size-5 text-red-500 dark:text-red-400" />
        </div>
        <div className="flex items-center space-x-3">
          <MusicItemCardImage />
          <div className="space-y-1">
            <Skeleton className="w-32 h-5 mt-1" />
            <Skeleton className="w-20 h-4 mt-1" />
          </div>
        </div>
        <Skeleton className="w-32 h-6 mt-3" />
      </Card>
    </div>
  );
};
