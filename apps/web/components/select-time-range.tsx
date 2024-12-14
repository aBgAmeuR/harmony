"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  getTimeRangeStatsAction,
  setTimeRangeStatsAction,
} from "~/actions/time-range-stats-actions";

const SELECT_OPTIONS = [
  { label: "Short Term", value: "short_term" },
  { label: "Medium Term", value: "medium_term" },
  { label: "Long Term", value: "long_term" },
];

export const SelectTimeRange = () => {
  const queryClient = useQueryClient();

  const {
    data: timeRange,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["timeRangeStats"],
    queryFn: getTimeRangeStatsAction,
  });

  const { mutate } = useMutation({
    mutationFn: async (timeRange: "short_term" | "medium_term" | "long_term") =>
      await setTimeRangeStatsAction(timeRange),
    onMutate: async (timeRange) => {
      await queryClient.cancelQueries({ queryKey: ["timeRangeStats"] });
      const previousTimeRange = queryClient.getQueryData(["timeRangeStats"]);
      queryClient.setQueryData(["timeRangeStats"], timeRange);
      return { previousTimeRange };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(["timeRangeStats"], context.previousTimeRange);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["timeRangeStats"] });
    },
  });

  const { data: session } = useSession();
  const isDemo = session ? session.user?.name === "Demo" : true;

  if (isError || isLoading || !timeRange) return null;

  if (!isDemo)
    return (
      <Select value={timeRange} onValueChange={mutate}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          {SELECT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Select value={timeRange} disabled>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {SELECT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="px-2 py-1 text-xs">
          This feature is disabled in demo mode
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
