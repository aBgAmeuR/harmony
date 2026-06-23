import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export type DateRangeMode = "month" | "year" | "custom";

type DateRangeState = {
  mode: DateRangeMode;
  cursorMs: number;
  customFrom: string | null;
  customTo: string | null;
  setMode: (mode: DateRangeMode) => void;
  setCursor: (date: Date) => void;
  step: (dir: -1 | 1) => void;
  setCustomRange: (from: string, to: string) => void;
};

function buildInstantRangeQuery({
  mode,
  cursorMs,
  customFrom,
  customTo,
}: Pick<DateRangeState, "mode" | "cursorMs" | "customFrom" | "customTo">) {
  const c = new Date(cursorMs);
  const y = c.getFullYear();
  const m = c.getMonth();

  if (mode === "custom") {
    if (!customFrom || !customTo) throw new Error("Custom range is not set");
    return { from: new Date(customFrom), to: new Date(customTo) };
  }
  if (mode === "month") return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0) };
  return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
}

export function useInstantRangeQuery() {
  const { mode, cursorMs, customFrom, customTo } = useDateRangeStore(
    useShallow((s) => ({
      mode: s.mode,
      cursorMs: s.cursorMs,
      customFrom: s.customFrom,
      customTo: s.customTo,
    })),
  );

  return useMemo(
    () => buildInstantRangeQuery({ mode, cursorMs, customFrom, customTo }),
    [mode, cursorMs, customFrom, customTo],
  );
}

export const useDateRangeStore = create<DateRangeState>()(
  persist(
    (set, get) => ({
      mode: "year",
      cursorMs: new Date(new Date().getFullYear(), 1).getTime(),
      customFrom: new Date(new Date().getFullYear(), 0, 1).toISOString(),
      customTo: new Date(new Date().getFullYear(), 11, 31).toISOString(),
      setMode: (mode) => set({ mode }),
      setCursor: (date) =>
        set({ cursorMs: new Date(date.getFullYear(), date.getMonth(), 1).getTime() }),
      step: (dir) => {
        const { mode, cursorMs } = get();
        if (mode !== "month" && mode !== "year") return;
        const d = new Date(cursorMs);
        if (mode === "month") d.setMonth(d.getMonth() + dir);
        else d.setFullYear(d.getFullYear() + dir);
        set({ cursorMs: new Date(d.getFullYear(), d.getMonth(), 1).getTime() });
      },
      setCustomRange: (from, to) => set({ customFrom: from, customTo: to }),
    }),
    {
      name: "harmony:date-range",
      partialize: ({ mode, cursorMs, customFrom, customTo }) => ({
        mode,
        cursorMs,
        customFrom,
        customTo,
      }),
    },
  ),
);
