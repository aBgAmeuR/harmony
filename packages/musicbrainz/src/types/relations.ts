import type { IArtist } from './artist.js'
import type { RelationDirection, IUrl } from './core.js'
import type { IRelease } from './release.js'

export interface IRelation {
  'artist'?: IArtist
  'attribute-ids': unknown[]
  'direction': RelationDirection
  'target-credit': string
  'end': null | unknown
  'source-credit': string
  'ended': boolean
  'attribute-values': unknown[]
  'type': string
  'type-id': string
  'target-type'?: 'url'
  'url'?: IUrl
  'release'?: IRelease
}

export interface IMayHaveRelations {
  relations?: IRelation[]
}
