import type {
  ICoverArtArchive,
  IEntity,
  IMatch,
  IReleaseEvent,
  ISearchResult,
  ReleasePackaging,
  ReleaseStatus,
} from './core.js'
import type { IArtistCredit } from './artist-credit.js'
import type { IMedium } from './medium.js'
import type { IReleaseGroup } from './release-group.js'
import type { IMayHaveRelations } from './relations.js'

export interface IRelease extends IEntity, IMayHaveRelations {
  'title': string
  'text-representation'?: { language: string; script: string }
  'disambiguation': string
  'asin': null | string
  'status': ReleaseStatus
  'status-id': string
  'packaging'?: ReleasePackaging
  'release-events'?: IReleaseEvent[]
  'date'?: string
  'media'?: IMedium[]
  'cover-art-archive'?: ICoverArtArchive
  'country'?: string
  'barcode'?: string
  'artist-credit'?: IArtistCredit[]
  'release-group'?: IReleaseGroup
  'track-count'?: number
  'count'?: number
}

export type IReleaseMatch = IRelease & IMatch

export interface IReleaseList extends ISearchResult {
  'releases': IReleaseMatch[]
  'releases-count'?: number
}
