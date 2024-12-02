"use client";

import { useQuery } from "@tanstack/react-query";

import { getMinMaxDateRangeAction } from "~/actions/get-min-max-date-range-action";
import { useRankingTimeRange } from "~/lib/store";

import { MonthRangePicker } from "./month-range-picker";

const useMinMaxDateRange = () =>
  useQuery({
    queryKey: ["minMaxDateRange"],
    queryFn: async () => await getMinMaxDateRangeAction(),
  });

export const SelectMonthRange = () => {
  const { data, error } = useMinMaxDateRange();
  const dates = useRankingTimeRange((state) => state.dates);
  const setDates = useRankingTimeRange((state) => state.setDates);

  if (error || !data) return null;

  if (!data.minDate || !data.maxDate) {
    setDates({
      start: new Date(),
      end: new Date(),
    });
  }

  return (
    <MonthRangePicker
      selectedMonthRange={{
        start: new Date(dates.start),
        end: new Date(dates.end),
      }}
      onMonthRangeSelect={setDates}
      minDate={data.minDate}
      maxDate={data.maxDate}
    />
  );
};
