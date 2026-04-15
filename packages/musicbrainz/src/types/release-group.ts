import type { IEntity, IMatch, ISearchResult } from './core.js'
import type { IArtistCredit } from './artist-credit.js'
import type { IRelease } from './release.js'

export interface IReleaseGroup extends IEntity {
  'count'?: number
  'disambiguation'?: string
  'title': string
  'secondary-types'?: string[]
  'first-release-date': string
  'primary-type': string
  'primary-type-id'?: string
  'artist-credit'?: IArtistCredit[]
  'releases'?: IRelease[]
}

export type IReleaseGroupMatch = IReleaseGroup & IMatch

export interface IReleaseGroupList extends ISearchResult {
  'release-groups': IReleaseGroupMatch[]
  'release-groups-count'?: number
}
