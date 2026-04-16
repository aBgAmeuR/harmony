import type { IRecordingList } from '../types/index.js'
import { buildRecordingQuery } from '../lib/build-recording-query.js'
import { MB_WS_V2_BASE } from '../lib/ws-base-url.js'
import type { SearchRecordingOptions, SearchRecordingParams } from '../options.js'
import { Manager } from './manager.js'

/**
 * Recording search (`/ws/2/recording`).
 * @see https://musicbrainz.org/doc/MusicBrainz_API/Search/RecordingSearch
 */
export class RecordingManager extends Manager {
  /**
   * GET /ws/2/recording?fmt=json&query=...&limit=...&offset=...&inc=...
   */
  async search(params: SearchRecordingParams, opts: SearchRecordingOptions = {}): Promise<IRecordingList> {
    const { limit = 2, offset = 0 } = opts
    const query = buildRecordingQuery(params)
    const url = new URL(`${MB_WS_V2_BASE}/recording`)
    url.searchParams.set('fmt', 'json')
    url.searchParams.set('query', query)
    url.searchParams.set('limit', String(Math.min(100, Math.max(1, limit))))
    url.searchParams.set('offset', String(Math.max(0, offset)))
    url.searchParams.set('inc', 'releases+recordings+media')

    return this.http.getJson<IRecordingList>(url)
  }
}
