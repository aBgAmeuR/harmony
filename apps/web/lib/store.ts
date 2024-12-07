/* eslint-disable no-unused-vars */
import { cookieStorage } from "@repo/zustand-cookie-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
      storage: createJSONStorage(() => cookieStorage),
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
  dates: { start: string; end: string };
  setDates: (dates: { start: Date; end: Date }) => void;
}

export const useRankingTimeRange = create(
  persist<RankingTimeRangeStore>(
    (set) => ({
      dates: {
        start: new Date("2016-01-01").toISOString(),
        end: new Date().toISOString(),
      },
      setDates: (dates) =>
        set({
          dates: {
            start: dates.start.toISOString(),
            end: dates.end.toISOString(),
          },
        }),
    }),
    {
      name: "ranking-time-range",
      storage: createJSONStorage(() => cookieStorage),
    },
  ),
);

interface SideBarStore {
  isSidebarOpen: boolean;
  setSidebarOpen: (isSidebarOpen: boolean) => void;
}

export const useSidebar = create(
  persist<SideBarStore>(
    (set) => ({
      isSidebarOpen: false,
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    {
      name: "sidebar",
      storage: createJSONStorage(() => cookieStorage),
    },
  ),
);
