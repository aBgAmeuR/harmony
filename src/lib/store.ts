import { create } from "zustand";

type TopTimeRange = "short_term" | "medium_term" | "long_term";

interface TopTimeRangeStore {
  time_range: TopTimeRange;
  setTimeRange: (time_range: TopTimeRange) => void;
}

export const useTopTimeRange = create<TopTimeRangeStore>((set) => ({
  time_range: "medium_term",
  setTimeRange: (time_range) => set({ time_range })
}));
