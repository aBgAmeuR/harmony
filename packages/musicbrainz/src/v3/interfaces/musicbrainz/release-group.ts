import { IArtistCredit } from './artist.js'
import { IRelease } from './release.js'
import { IEntity, IMatch, ISearchResult } from './shared/core.js'

export interface SearchReleaseGroupParams {
  artist: string
  release: string
}

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
