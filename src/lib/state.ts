import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TimeRange = "6months" | "1year" | "alltime"

interface TimeRangeState {
  timeRange: TimeRange
  setTimeRange: (TimeRange: TimeRange) => void
}

export const useTimeRangeStore = create(
  persist<TimeRangeState>(
    (set) => ({
      timeRange: "6months",
      setTimeRange: (TimeRange) => set({ timeRange: TimeRange }),
    }),
    {
      name: "timeRange",
    }
  )
)
