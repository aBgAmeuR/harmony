import { createContext, use, type ReactNode } from "react";

import { useDateRangeBounds } from "./use-date-range-bounds";

type DateRangeBoundsContextValue = ReturnType<typeof useDateRangeBounds>;

const DateRangeBoundsContext = createContext<DateRangeBoundsContextValue | null>(null);

type DateRangeBoundsProviderProps = {
  children: ReactNode;
  monthlyListenLabels?: string[];
};

export const DateRangeBoundsProvider = ({
  children,
  monthlyListenLabels,
}: DateRangeBoundsProviderProps) => {
  const value = useDateRangeBounds(monthlyListenLabels);

  return <DateRangeBoundsContext value={value}>{children}</DateRangeBoundsContext>;
};

export const useDateRangeBoundsContext = (): DateRangeBoundsContextValue => {
  const context = use(DateRangeBoundsContext);
  if (!context) {
    throw new Error("useDateRangeBoundsContext must be used within DateRangeBoundsProvider");
  }
  return context;
};
