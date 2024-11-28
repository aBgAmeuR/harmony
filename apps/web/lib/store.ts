/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TopTimeRange = "short_term" | "medium_term" | "long_term";

interface TopTimeRangeStore {
  time_range: TopTimeRange;
  setTimeRange: (time_range: TopTimeRange) => void;
}

export const useTopTimeRange = create(
  persist<TopTimeRangeStore>(
    (set) => ({
      time_range: "medium_term",
      setTimeRange: (time_range) => set({ time_range }),
    }),
    {
      name: "top-time-range",
    },
  ),
);

interface ListLayoutStore {
  list_layout: "grid" | "list";
  setListLayout: (list_layout: "grid" | "list") => void;
}

export const useListLayout = create<ListLayoutStore>((set) => ({
  list_layout: "list",
  setListLayout: (list_layout) => set({ list_layout }),
}));

interface RankingTimeRangeStore {
  dates: { start: Date; end: Date };
  setDates: (dates: { start: Date; end: Date }) => void;
}

export const useRankingTimeRange = create(
  persist<RankingTimeRangeStore>(
    (set) => ({
      dates: {
        start: new Date(),
        end: new Date(),
      },
      setDates: (dates) => set({ dates }),
    }),
    {
      name: "ranking-time-range",
    },
  ),
);
