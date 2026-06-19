import type { DuckCatalogRow, ListeningHabitMetric, ListeningHabitTrendPoint } from './types'
import { buildListeningHeatmapColumns } from '@/lib/listening-habits/build-listening-heatmap'
import { useDbStore } from '@/stores/db-store'

export async function runDuckQuery<T = DuckCatalogRow>(sql: string): Promise<Array<T>> {
  const conn = useDbStore.getState().conn
  if (!conn) {
    throw new Error('Database connection not available')
  }

  const result = await conn.query(sql)
  return result.toArray() as Array<T>
}

export async function fetchListeningHabitMetric(
  valueSql: string,
  trendSql: string,
): Promise<ListeningHabitMetric> {
  const valueRows = await runDuckQuery<{ value: number }>(valueSql)
  const trendRows = await runDuckQuery<ListeningHabitTrendPoint>(trendSql)

  return {
    value: Number(valueRows[0]?.value ?? 0),
    trend: trendRows.map((row) => ({
      label: String(row.label),
      value: Number(row.value),
    })),
  }
}

export async function fetchAvgDailyPlaytimeMetric(
  valueSql: string,
  trendSql: string,
  dailySql: string,
): Promise<ListeningHabitMetric> {
  const valueRows = await runDuckQuery<{ value: number }>(valueSql)
  const trendRows = await runDuckQuery<ListeningHabitTrendPoint>(trendSql)
  const dailyRows = await runDuckQuery<{ day: string; value: number }>(dailySql)
  const { columns, minutesByDate } = buildListeningHeatmapColumns(dailyRows)

  return {
    value: Number(valueRows[0]?.value ?? 0),
    trend: trendRows.map((row) => ({
      label: String(row.label),
      value: Number(row.value),
    })),
    heatmap: columns,
    heatmapMinutesByDate: minutesByDate,
  }
}

export function toCatalogItems(
  rows: Array<DuckCatalogRow>,
  formatDescription?: (description: string) => string,
) {
  return rows.map((row) => ({
    id: Number(row.id || 0),
    name: row.name ?? '',
    description: formatDescription
      ? formatDescription(row.description ?? '')
      : (row.description ?? ''),
    image: row.image ?? '',
    streams: row.streams ?? 0,
    playtime: row.playtime ?? 0,
  }))
}
