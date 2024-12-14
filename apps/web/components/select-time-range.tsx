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
import { useSession } from "next-auth/react";

import { useTopTimeRange } from "~/lib/store";

const SELECT_OPTIONS = [
  { label: "Short Term", value: "short_term" },
  { label: "Medium Term", value: "medium_term" },
  { label: "Long Term", value: "long_term" },
];

export const SelectTimeRange = () => {
  const timeRange = useTopTimeRange((e) => e.time_range);
  const setTimeRange = useTopTimeRange((e) => e.setTimeRange);
  const { data: session } = useSession();
  const isDemo = session?.user?.name === "Demo";
  if (isDemo)
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

  return (
    <Select value={timeRange} onValueChange={setTimeRange}>
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
};
