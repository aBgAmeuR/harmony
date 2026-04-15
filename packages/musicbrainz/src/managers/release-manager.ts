import type { IRelease, IReleaseGroup, IReleaseGroupList } from '../types/index.js'
import { buildReleaseGroupQuery } from '../lib/build-release-group-query.js'
import { MB_WS_V2_BASE } from '../lib/ws-base-url.js'
import type { ReleaseInclude, SearchReleaseOptions, SearchReleaseParams } from '../options.js'
import { RELEASE_LOOKUP_DEFAULT_INC } from '../options.js'
import { Manager } from './manager.js'

/**
 * Release lookup (`/ws/2/release`) and release-group search (`/ws/2/release-group`).
 * @see https://musicbrainz.org/doc/MusicBrainz_API/Lookup
 * @see https://musicbrainz.org/doc/MusicBrainz_API/Search/ReleaseGroupSearch
 */
export class ReleaseManager extends Manager {
  /**
   * GET /ws/2/release-group?fmt=json&query=...&limit=...&offset=...&inc=...
   */
  async search(
    params: SearchReleaseParams,
    withQuotes: boolean = true
  ): Promise<IReleaseGroupList> {
    const query = buildReleaseGroupQuery(params, withQuotes)
    const url = new URL(`${MB_WS_V2_BASE}/release-group`)
    url.searchParams.set('fmt', 'json')
    url.searchParams.set('query', query)
    url.searchParams.set('limit', String(Math.min(100, Math.max(1, 4))))

    return await this.http.getJson<IReleaseGroupList>(url)
  }

  /**
   * GET /ws/2/release/{mbid}?fmt=json&inc=recordings+media+artist-credits (by default)
   * @see https://musicbrainz.org/doc/MusicBrainz_API/Lookup
   */
  async get(mbid: string, inc: ReleaseInclude[] = [...RELEASE_LOOKUP_DEFAULT_INC]): Promise<IRelease> {
    const url = new URL(`${MB_WS_V2_BASE}/release/${encodeURIComponent(mbid)}`)
    url.searchParams.set('fmt', 'json')
    if (inc.length) {
      url.searchParams.set('inc', inc.join('+'))
    }

    return this.http.getJson<IRelease>(url)
  }
}
