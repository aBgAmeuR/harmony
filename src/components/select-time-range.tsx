"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTopTimeRange } from "@/lib/store";

const SELECT_OPTIONS = [
  { label: "Last 4 weeks", value: "short_term" },
  { label: "Last 6 months", value: "medium_term" },
  { label: "1 year", value: "long_term" }
];

export const SelectTimeRange = () => {
  const timeRange = useTopTimeRange();

  return (
    <Select value={timeRange.time_range} onValueChange={timeRange.setTimeRange}>
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
