import { create } from "zustand"

export type TimeRange = "6months" | "1year" | "alltime"

interface TimeRangeState {
  timeRange: TimeRange
  setTimeRange: (TimeRange: TimeRange) => void
}

export const useTimeRangeStore = create<TimeRangeState>()((set) => ({
  timeRange: "6months",
  setTimeRange: (TimeRange) => set({ timeRange: TimeRange }),
}))