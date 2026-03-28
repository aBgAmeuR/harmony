import type { IRelease } from '../types/index.js'
import { MB_WS_V2_BASE } from '../lib/ws-base-url.js'
import { Manager } from './manager.js'

/**
 * Release lookup (`/ws/2/release`).
 * @see https://musicbrainz.org/doc/MusicBrainz_API/Lookup
 */
export class ReleaseManager extends Manager {
  /**
   * GET /ws/2/release/{mbid}?inc=...&fmt=json
   */
  async get(mbid: string, inc: string[] = ['recordings', 'media']): Promise<IRelease> {
    const url = new URL(`${MB_WS_V2_BASE}/release/${encodeURIComponent(mbid)}`)
    url.searchParams.set('fmt', 'json')
    if (inc.length) {
      url.searchParams.set('inc', inc.join('+'))
    }

    return this.http.getJson<IRelease>(url)
  }
}
