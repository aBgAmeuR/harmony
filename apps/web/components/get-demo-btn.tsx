"use client";

import { signIn } from "@repo/auth/actions";
import { Button } from "@repo/ui/button";

import { getDemoDateRangeAction } from "~/actions/get-demo-date-range-action";
import { useRankingTimeRange } from "~/lib/store";

export const GetDemoBtn = () => {
  const setRankingTimeRange = useRankingTimeRange((state) => state.setDates);

  const onClick = async () => {
    const timeRange = await getDemoDateRangeAction();
    if (!timeRange) return;
    setRankingTimeRange({
      start: timeRange.minDate,
      end: timeRange.maxDate,
    });

    await signIn("credentials", {
      username: "demo",
      password: "demo",
      redirect: true,
      redirectTo: "/overview",
    });
  };

  return (
    <Button onClick={onClick} variant="link" className="p-0 text-chart-1">
      Get a demo of Harmony
    </Button>
  );
};
