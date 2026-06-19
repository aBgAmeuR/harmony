import {
  IReleaseGroupList,
  SearchReleaseGroupParams,
} from '../../interfaces/musicbrainz/release-group.js'
import { escapeLucene } from '../../util/escape.js'
import { Manager } from '../manager.js'

const RELEASE_SEARCH_STATUS_OFFICIAL = 'Official' as const

export class ReleaseGroupManager extends Manager {
  private buildSearchQuery(params: SearchReleaseGroupParams, withQuotes: boolean = true) {
    const quote = (value: string) => (withQuotes ? `"${escapeLucene(value)}"` : escapeLucene(value))

    return [
      `artist:${quote(params.artist)}`,
      `release:${quote(params.release)}`,
      `status:${quote(RELEASE_SEARCH_STATUS_OFFICIAL)}`,
    ].join(' AND ')
  }

  async search(params: SearchReleaseGroupParams, withQuotes: boolean = true) {
    const query = this.buildSearchQuery(params, withQuotes)
    return this.http.get<IReleaseGroupList>('/release-group', {
      fmt: 'json',
      query,
      limit: '4',
    })
  }
}
