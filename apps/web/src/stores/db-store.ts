import { create } from 'zustand'
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { getDuckDB, registerPackageDatabase } from '@/lib/duckdb'

const PACKAGE_ID = 'gjLSjS'
const PACKAGE_DUCKDB_URL = `http://localhost:3000/api/v1/packages/${PACKAGE_ID}/db`

type DbStatus = 'idle' | 'loading' | 'ready' | 'error'

type DbStore = {
  conn: AsyncDuckDBConnection | null
  status: DbStatus
  error: Error | null
  initialize: () => Promise<void>
}

let initPromise: Promise<void> | null = null

export const useDbStore = create<DbStore>()((set, get) => ({
  conn: null,
  status: 'idle',
  error: null,
  initialize: async () => {
    const { status } = get()
    if (status === 'ready' || status === 'error') return
    if (initPromise) return initPromise

    initPromise = (async () => {
      set({ status: 'loading', error: null })

      try {
        const db = await getDuckDB()
        const fileName = await registerPackageDatabase(db, PACKAGE_ID, PACKAGE_DUCKDB_URL)
        const conn = await db.connect()
        await conn.query(`ATTACH '${fileName}' AS pkg (READ_ONLY)`)
        await conn.query(`USE pkg`)

        set({ conn, status: 'ready' })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error('Erreur chargement base du package', err)
        set({ conn: null, status: 'error', error })
        initPromise = null
        throw error
      }
    })()

    return initPromise
  },
}))
