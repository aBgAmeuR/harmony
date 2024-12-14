import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { getMinMaxDateRangeAction } from "~/actions/get-min-max-date-range-action";
import {
  getMonthRangeAction,
  setMonthStatsAction,
} from "~/actions/month-range-actions";
import { addMonths } from "~/components/month-range-picker";

const useMinMaxDateRange = () =>
  useQuery({
    queryKey: ["minMaxDateRange"],
    queryFn: async () => await getMinMaxDateRangeAction(),
  });

const useMonthRange = () =>
  useQuery({
    queryKey: ["monthRange"],
    queryFn: async () => await getMonthRangeAction(),
  });

export const useSelectMonthRange = () => {
  const { data: session } = useSession();
  const isDemo = session?.user?.name === "Demo";
  const queryClient = useQueryClient();
  const { data: minMaxDateRange, error: minMaxDateRangeError } =
    useMinMaxDateRange();
  const { data: monthRange, error: monthRangeError } = useMonthRange();
  const { mutate } = useMutation({
    mutationFn: async ({ start, end }: { start: Date; end: Date }) =>
      await setMonthStatsAction(start, addMonths(end, 1)),
    onMutate: async ({ start, end }: { start: Date; end: Date }) => {
      await queryClient.cancelQueries({ queryKey: ["monthRange"] });
      const previousMonthRange = queryClient.getQueryData(["monthRange"]);
      queryClient.setQueryData(["monthRange"], {
        dateStart: start,
        dateEnd: addMonths(end, 1),
      });
      return { previousMonthRange };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(["monthRange"], context.previousMonthRange);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["monthRange"] });
    },
  });

  const isError = minMaxDateRangeError || monthRangeError;

  const monthRangeDates = monthRange
    ? {
        dateStart: monthRange.dateStart,
        dateEnd: addMonths(monthRange.dateEnd, -1),
      }
    : null;

  return {
    isDemo,
    minMaxDateRange,
    monthRange: monthRangeDates,
    isError,
    mutate,
  };
};
