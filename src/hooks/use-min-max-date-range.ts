import { useEffect, useState } from "react";

import { db } from "@/lib/db";

export const useMinMaxDateRange = () => {
  const [minMaxDates, setMinMaxDates] = useState<{
    minDate: Date;
    maxDate: Date;
  }>();

  useEffect(() => {
    async function fetchData() {
      const minDate = await db.playback.orderBy("timestamp").first();
      const maxData = await db.playback.orderBy("timestamp").last();

      setMinMaxDates({
        minDate: new Date(minDate?.timestamp ?? 0),
        maxDate: new Date(maxData?.timestamp ?? 0)
      });
    }
    fetchData();
  }, []);

  return minMaxDates;
};
