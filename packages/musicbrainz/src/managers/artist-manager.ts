import type { IArtist } from '../types/index.js'
import { MB_WS_V2_BASE } from '../lib/ws-base-url.js'
import type { ArtistInclude } from '../options.js'
import { Manager } from './manager.js'

/**
 * Artist lookup (`/ws/2/artist`).
 * @see https://musicbrainz.org/doc/MusicBrainz_API/Lookup
 */
export class ArtistManager extends Manager {
  /**
   * GET /ws/2/artist/{mbid}?inc=...&fmt=json
   */
  async get(mbid: string, inc?: ArtistInclude[]): Promise<IArtist> {
    const url = new URL(`${MB_WS_V2_BASE}/artist/${encodeURIComponent(mbid)}`)
    url.searchParams.set('fmt', 'json')
    if (inc?.length) {
      url.searchParams.set('inc', inc.join('+'))
    }

    return this.http.getJson<IArtist>(url)
  }
}
