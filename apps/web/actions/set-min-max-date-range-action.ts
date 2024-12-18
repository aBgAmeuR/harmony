"use server";

import { cookies } from "next/headers";

import { getMinMaxDateRangeAction } from "./get-min-max-date-range-action";

export const setMinMaxDateRangeAction = async () => {
  const cookieStore = await cookies();
  const minMaxDate = await getMinMaxDateRangeAction();

  if (!minMaxDate)
    return {
      dateStart: new Date(),
      dateEnd: new Date(),
    };

  cookieStore.set(
    "ranking-time-range|state|dates|start",
    minMaxDate.minDate.toString(),
  );
  cookieStore.set(
    "ranking-time-range|state|dates|end",
    minMaxDate.maxDate.toString(),
  );

  return {
    dateStart: minMaxDate.minDate,
    dateEnd: minMaxDate.maxDate,
  };
};
