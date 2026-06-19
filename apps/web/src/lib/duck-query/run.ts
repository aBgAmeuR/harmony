import { useDbStore } from '@/stores/db-store'
import type { DuckCatalogRow } from './types'

export async function runDuckQuery<T = DuckCatalogRow>(sql: string): Promise<Array<T>> {
  const conn = useDbStore.getState().conn
  if (!conn) {
    throw new Error('Database connection not available')
  }

  const result = await conn.query(sql)
  return result.toArray() as Array<T>
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
