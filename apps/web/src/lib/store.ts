import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export type DateRangeMode = 'month' | 'year' | 'custom'

export type InstantRangeQuery = { from?: string; to?: string }

export type DateRangeState = {
  mode: DateRangeMode
  cursorMs: number
  customFrom: string | null
  customTo: string | null
  setMode: (mode: DateRangeMode) => void
  setCursor: (date: Date) => void
  step: (dir: -1 | 1) => void
  setCustomRange: (from: string, to: string) => void
}

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function asYmd(s: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : ymd(d)
}

export function buildInstantRangeQuery(s: {
  mode: DateRangeMode
  cursorMs: number
  customFrom: string | null
  customTo: string | null
}): InstantRangeQuery {
  if (s.mode === 'custom') {
    console.log('custom', s.customFrom, s.customTo)
    if (!s.customFrom || !s.customTo) return {}
    const from = asYmd(s.customFrom)
    const to = asYmd(s.customTo)
    return from && to ? { from, to } : {}
  }

  const c = new Date(s.cursorMs)
  const y = c.getFullYear()
  const m = c.getMonth()

  if (s.mode === 'month') {
    return { from: ymd(new Date(y, m, 1)), to: ymd(new Date(y, m + 1, 0)) }
  }

  return { from: ymd(new Date(y, 0, 1)), to: ymd(new Date(y, 11, 31)) }
}

export const selectInstantRangeQuery = (s: DateRangeState): InstantRangeQuery =>
  buildInstantRangeQuery({
    mode: s.mode,
    cursorMs: s.cursorMs,
    customFrom: s.customFrom,
    customTo: s.customTo,
  })

export const selectCursorMs = (s: DateRangeState) => s.cursorMs

export const useDateRangeStore = create<DateRangeState>()(
  persist(
    (set, get) => ({
      mode: 'month',
      cursorMs: new Date(2024, 0, 1).getTime(),
      customFrom: null,
      customTo: null,
      setMode: (mode) => set({ mode }),
      setCursor: (date) =>
        set({ cursorMs: new Date(date.getFullYear(), date.getMonth(), 1).getTime() }),
      step: (dir) => {
        const { mode, cursorMs } = get()
        if (mode !== 'month' && mode !== 'year') return
        const d = new Date(cursorMs)
        if (mode === 'month') d.setMonth(d.getMonth() + dir)
        else d.setFullYear(d.getFullYear() + dir)
        set({ cursorMs: new Date(d.getFullYear(), d.getMonth(), 1).getTime() })
      },
      setCustomRange: (from, to) => set({ customFrom: from, customTo: to }),
    }),
    {
      name: 'harmony:date-range',
      partialize: ({ mode, cursorMs, customFrom, customTo }) => ({
        mode,
        cursorMs,
        customFrom,
        customTo,
      }),
    }
  )
)

export function useInstantRangeQuery(): InstantRangeQuery {
  return useDateRangeStore(useShallow(selectInstantRangeQuery))
}

export function useCursorDate(): Date {
  const ms = useDateRangeStore(selectCursorMs)
  return useMemo(() => new Date(ms), [ms])
}
