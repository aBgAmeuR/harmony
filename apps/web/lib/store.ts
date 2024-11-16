import { create } from "zustand";
import { persist } from "zustand/middleware";

type TopTimeRange = "short_term" | "medium_term" | "long_term";

interface TopTimeRangeStore {
  time_range: TopTimeRange;
  // eslint-disable-next-line no-unused-vars
  setTimeRange: (time_range: TopTimeRange) => void;
  list_layout: "grid" | "list";
  // eslint-disable-next-line no-unused-vars
  setListLayout: (list_layout: "grid" | "list") => void;
}

export const useTopTimeRange = create(
  persist<TopTimeRangeStore>(
    (set) => ({
      time_range: "medium_term",
      setTimeRange: (time_range) => set({ time_range }),
      list_layout: "list",
      setListLayout: (list_layout) => set({ list_layout }),
    }),
    {
      name: "top-time-range",
    },
  ),
);
