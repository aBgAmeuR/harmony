import { IMayHaveRelations } from './relations.js'
import { IReleaseGroup } from './release-group.js'
import {
  ICoverArtArchive,
  IEntity,
  IMatch,
  IReleaseEvent,
  ISearchResult,
  ReleasePackaging,
  ReleaseStatus,
} from './shared/core.js'
import { IMedium } from './medium.js'
import { IArtistCredit } from './artist.js'

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
