"use client";

import { Button } from "@repo/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { getMinMaxDateRangeAction } from "~/actions/get-min-max-date-range-action";
import { useRankingTimeRange } from "~/lib/store";

import { formatDate, MonthRangePicker } from "./month-range-picker";

const useMinMaxDateRange = () =>
  useQuery({
    queryKey: ["minMaxDateRange"],
    queryFn: async () => await getMinMaxDateRangeAction(),
  });

export const SelectMonthRange = () => {
  const { data, error } = useMinMaxDateRange();
  const dates = useRankingTimeRange((state) => state.dates);
  const setDates = useRankingTimeRange((state) => state.setDates);
  const { data: session } = useSession();
  const isDemo = session?.user?.name === "Demo";

  if (error || !data) return null;

  if (!data.minDate || !data.maxDate) {
    setDates({
      start: new Date(),
      end: new Date(),
    });
  }

  const selectedMonthRange = {
    start: new Date(dates.start),
    end: new Date(dates.end),
  };

  if (isDemo) {
    const buttonLabel = selectedMonthRange
      ? selectedMonthRange.start.getTime() === selectedMonthRange.end.getTime()
        ? formatDate(selectedMonthRange.start)
        : `${formatDate(selectedMonthRange.start)} - ${formatDate(selectedMonthRange.end)}`
      : "Pick a month range";

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger className="cursor-not-allowed" asChild>
            <span tabIndex={0}>
              <Button
                variant={"outline"}
                className="w-[280px] justify-start text-left font-normal"
                disabled
              >
                <CalendarIcon className="mr-2 size-4" />
                {buttonLabel}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="px-2 py-1 text-xs">
            This feature is disabled in demo mode
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <MonthRangePicker
      selectedMonthRange={selectedMonthRange}
      onMonthRangeSelect={setDates}
      minDate={data.minDate}
      maxDate={data.maxDate}
    />
  );
};
