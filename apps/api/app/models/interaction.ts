import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { InteractionSchema } from '#database/schema'

export type InteractionRow = {
  trackId: number
  timestamp: Date | DateTime | string
  msPlayed: number
  platform: string | null
  reasonStart: string | null
  reasonEnd: string | null
  shuffle: boolean | null
  skipped: boolean | null
  offline: boolean | null
}

export default class Interaction extends InteractionSchema {
  static async saveBatch(packageId: string, rows: InteractionRow[]) {
    if (rows.length === 0) return

    const knex = db.connection().getWriteClient()
    const rawRows = rows.map((r) => ({
      package_id: packageId,
      track_id: r.trackId,
      timestamp:
        r.timestamp instanceof Date
          ? r.timestamp
          : DateTime.fromISO(String(r.timestamp)).toJSDate(),
      ms_played: r.msPlayed,
      platform: r.platform,
      reason_start: r.reasonStart,
      reason_end: r.reasonEnd,
      shuffle: r.shuffle,
      skipped: r.skipped,
      offline: r.offline,
    }))

    await knex('interactions').insert(rawRows).onConflict(['package_id', 'timestamp']).ignore()
  }
}
