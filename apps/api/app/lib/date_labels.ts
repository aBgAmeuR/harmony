import type { TrendPoint } from '#dtos/track_dtos'
import { type DateTime } from 'luxon'

export const EN_SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export const WEEKDAY_LABELS_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export function isSameCalendarMonth(from: DateTime, to: DateTime): boolean {
  return from.year === to.year && from.month === to.month
}

export function monthLabelEn(dt: DateTime): string {
  return `${EN_SHORT_MONTHS[dt.month - 1]} ${dt.year}`
}

export function ymKey(dt: DateTime): string {
  return `${dt.year}-${dt.month}`
}

export function fillTrendByDay(
  from: DateTime,
  to: DateTime,
  minutesByDay: Map<number, number>
): TrendPoint[] {
  const out: TrendPoint[] = []
  let cursor = from.startOf('day')
  const end = to.startOf('day')
  while (cursor <= end) {
    out.push({ label: String(cursor.day), value: minutesByDay.get(cursor.day) ?? 0 })
    cursor = cursor.plus({ days: 1 })
  }
  return out
}

export function fillTrendByMonth(
  from: DateTime,
  to: DateTime,
  minutesByYm: Map<string, number>
): TrendPoint[] {
  const out: TrendPoint[] = []
  let cursor = from.startOf('month')
  const end = to.startOf('month')
  while (cursor <= end) {
    out.push({ label: monthLabelEn(cursor), value: minutesByYm.get(ymKey(cursor)) ?? 0 })
    cursor = cursor.plus({ months: 1 })
  }
  return out
}
