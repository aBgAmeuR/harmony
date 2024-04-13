import { TimeRange } from "@/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TimeRangeState {
  timeRange: TimeRange
  setTimeRange: (TimeRange: TimeRange) => void
}

export const useTimeRangeStore = create(
  persist<TimeRangeState>(
    (set) => ({
      timeRange: "short_term",
      setTimeRange: (TimeRange: TimeRange) => set({ timeRange: TimeRange }),
    }),
    {
      name: "timeRange",
    }
  )
)
