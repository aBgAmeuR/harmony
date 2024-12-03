"server-only";

import { cookies } from "next/headers";

import { getMinMaxDateRangeAction } from "~/actions/get-min-max-date-range-action";

export const getCookieRankingTimeRange = async () => {
  const cookieStore = cookies();
  const cookieDateStart = cookieStore.get(
    "ranking-time-range|state|dates|start",
  );
  const cookieDateEnd = cookieStore.get("ranking-time-range|state|dates|end");

  if (!cookieDateStart || !cookieDateEnd) {
    const minMaxDates = await getMinMaxDateRangeAction();
    return {
      dateStart: minMaxDates ? minMaxDates.minDate : new Date(),
      dateEnd: minMaxDates ? minMaxDates.maxDate : new Date(),
    };
  }

  return {
    dateStart: new Date(cookieDateStart.value),
    dateEnd: new Date(cookieDateEnd.value),
  };
};

export const addMonths = (input: Date, months: number) => {
  const date = new Date(input);
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  date.setDate(
    Math.min(
      input.getDate(),
      getDaysInMonth(date.getFullYear(), date.getMonth() + 1),
    ),
  );
  return date;
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();
