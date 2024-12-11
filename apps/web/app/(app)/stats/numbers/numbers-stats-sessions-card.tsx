"use client";

import { Card } from "@repo/ui/card";
import { NumberFlow } from "@repo/ui/number";
import { Skeleton } from "@repo/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

import { getNumbersSessionStatsAction } from "~/actions/get-numbers-session-stats-action";
import { addMonths } from "~/components/month-range-picker";
import { useRankingTimeRange } from "~/lib/store";

type InitialData = Awaited<ReturnType<typeof getNumbersSessionStatsAction>>;

type NumbersStatsCardsProps = {
  initialData: InitialData;
};

const getMsToHoursAndMinutes = (ms: number) => {
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);

  return { hours, minutes };
};

const useNumbersSessionStats = (
  minDate: Date,
  maxDate: Date,
  initialData: InitialData,
) =>
  useQuery({
    queryKey: ["numbersSessionStats", minDate, maxDate],
    queryFn: async () => await getNumbersSessionStatsAction(minDate, maxDate),
    initialData,
  });

export const NumbersStatsSessionCard = ({
  initialData,
}: NumbersStatsCardsProps) => {
  const dates = useRankingTimeRange((state) => state.dates);
  const { data, isLoading, isError } = useNumbersSessionStats(
    new Date(dates.start),
    addMonths(new Date(dates.end), 1),
    initialData,
  );

  if (isLoading) return null;
  if (isError || !data) return null;

  return (
    <Card className="p-6 col-span-full">
      <h3 className="font-semibold mb-4">Listening Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
          {/* <p className="text-2xl font-bold">1,447</p> */}
          <p className="text-2xl font-bold">
            <NumberFlow
              value={data.totalSessions}
              format={{ notation: "standard" }}
              locales="en-US"
            />
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Average Session</p>
          <p className="text-2xl font-bold">
            <NumberFlow
              value={Math.floor(data.averageSessionTime / 1000 / 60)}
              format={{ notation: "standard" }}
              locales="en-US"
              suffix=" minutes"
            />
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Longest Session</p>
          {/* <p className="text-2xl font-bold">6 hours 54 minutes</p> */}
          <p className="text-2xl font-bold">
            <NumberFlow
              value={getMsToHoursAndMinutes(data.longestSession).hours}
              format={{ notation: "standard" }}
              locales="en-US"
              suffix=" hours "
            />
            <NumberFlow
              value={getMsToHoursAndMinutes(data.longestSession).minutes}
              format={{ notation: "standard" }}
              locales="en-US"
              suffix=" minutes"
            />
          </p>
        </div>
      </div>
    </Card>
  );
};

export const NumbersStatsSessionSkeleton = () => {
  return (
    <Card className="p-6 col-span-full">
      <h3 className="font-semibold mb-4">Listening Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
          <Skeleton className="w-20 h-7 mt-1" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Average Session</p>
          <Skeleton className="w-36 h-7 mt-1" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Longest Session</p>
          <Skeleton className="w-48 h-7 mt-1" />
        </div>
      </div>
    </Card>
  );
};
