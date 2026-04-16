import type { SearchReleaseParams } from '../../options.js'
import type { IReleaseGroupList } from '../../types/index.js'
import { buildReleaseGroupQuery } from '../lib/build-release-group-query.js'
import { Manager } from './manager.js'

export class ReleaseGroupManager extends Manager {
  async search(params: SearchReleaseParams, withQuotes: boolean = true): Promise<IReleaseGroupList> {
    const query = buildReleaseGroupQuery(params, withQuotes)
    return this.http.get<IReleaseGroupList>('/release-group', {
      fmt: 'json',
      query,
      limit: '4',
    })
  }
}
