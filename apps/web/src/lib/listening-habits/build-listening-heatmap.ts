import type { HeatmapColumn } from '@harmony/ui/charts'

export type DailyPlaytimeRow = {
  day: string
  value: number
}

export function getPlaytimeHeatmapLevel(minutes: number): number {
  if (minutes <= 0) {
    return 0
  }
  if (minutes < 30) {
    return 1
  }
  if (minutes < 60) {
    return 2
  }
  if (minutes < 120) {
    return 3
  }
  return 4
}

function parseLocalDate(day: string): Date {
  const [year, month, date] = day.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, date)
}

function startOfWeekSunday(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return start
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getListeningYears(minutesByDate: Record<string, number>): Array<number> {
  const years = new Set<number>()

  for (const day of Object.keys(minutesByDate)) {
    years.add(Number(day.slice(0, 4)))
  }

  return [...years].sort((a, b) => a - b)
}

export function getCalendarYearDomain(year: number): [Date, Date] {
  return [new Date(year, 0, 1), new Date(year, 11, 31, 23, 59, 59, 999)]
}

export function countHeatmapColumnsInDomain(
  columns: Array<HeatmapColumn>,
  domain: [Date, Date],
): number {
  const start = domain[0].getTime()
  const end = domain[1].getTime()

  return columns.filter((column) => {
    const weekStart = column.bins[0]?.date.getTime()
    const weekEnd = column.bins.at(-1)?.date.getTime()

    if (weekStart == null || weekEnd == null) {
      return false
    }

    return weekEnd >= start && weekStart <= end
  }).length
}

function buildHeatmapWeekColumns(
  firstWeekStart: Date,
  lastWeekStart: Date,
  minutesByDate: Record<string, number>,
  year?: number,
): Array<HeatmapColumn> {
  const columns: Array<HeatmapColumn> = []
  let weekStart = new Date(firstWeekStart)
  let columnIndex = 0

  while (weekStart.getTime() <= lastWeekStart.getTime()) {
    const bins = Array.from({ length: 7 }, (_, row) => {
      const date = addDays(weekStart, row)
      const key = toDateKey(date)
      const inYear = year == null || date.getFullYear() === year
      const minutes = inYear ? (minutesByDate[key] ?? 0) : 0

      return {
        bin: row,
        count: getPlaytimeHeatmapLevel(minutes),
        date,
      }
    })

    columns.push({
      bin: columnIndex,
      bins,
    })

    columnIndex += 1
    weekStart = addDays(weekStart, 7)
  }

  return columns
}

/** Full GitHub-style grid for a calendar year (Jan–Dec), including empty weeks/days. */
export function buildYearHeatmapColumns(
  year: number,
  minutesByDate: Record<string, number>,
): Array<HeatmapColumn> {
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)

  return buildHeatmapWeekColumns(
    startOfWeekSunday(yearStart),
    startOfWeekSunday(yearEnd),
    minutesByDate,
    year,
  )
}

export function buildListeningHeatmapColumns(dailyRows: Array<DailyPlaytimeRow>): {
  columns: Array<HeatmapColumn>
  minutesByDate: Record<string, number>
} {
  const minutesByDate: Record<string, number> = {}

  for (const row of dailyRows) {
    const day = String(row.day).slice(0, 10)
    minutesByDate[day] = Number(row.value)
  }

  const sortedDays = Object.keys(minutesByDate).sort()
  if (sortedDays.length === 0) {
    return { columns: [], minutesByDate }
  }

  const firstDay = parseLocalDate(sortedDays[0])
  const lastDay = parseLocalDate(sortedDays[sortedDays.length - 1])

  const columns = buildHeatmapWeekColumns(
    startOfWeekSunday(firstDay),
    startOfWeekSunday(lastDay),
    minutesByDate,
  )

  return { columns, minutesByDate }
}
