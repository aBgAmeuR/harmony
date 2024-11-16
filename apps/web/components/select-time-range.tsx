"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

import { useTopTimeRange } from "~/lib/store";

const SELECT_OPTIONS = [
  { label: "Last 4 weeks", value: "short_term" },
  { label: "Last 6 months", value: "medium_term" },
  { label: "1 year", value: "long_term" },
];

export const SelectTimeRange = () => {
  const timeRange = useTopTimeRange((e) => e.time_range);
  const setTimeRange = useTopTimeRange((e) => e.setTimeRange);

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
