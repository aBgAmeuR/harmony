import type { IAlias, IArea, IGenre, IArtistTag, IRating, IPeriod, ITypedEntity } from './core.js'
import type { IMayHaveRelations } from './relations.js'
import type { IRelease } from './release.js'
import type { IReleaseGroup } from './release-group.js'

export interface IArtist extends ITypedEntity, IMayHaveRelations {
  'name': string
  'disambiguation': string
  'sort-name': string
  'gender-id'?: string
  'life-span'?: IPeriod
  'country'?: string
  'ipis'?: string[]
  'isnis'?: string[]
  'aliases'?: IAlias[]
  'gender'?: 'male' | 'female' | 'other' | 'not applicable'
  'area'?: IArea
  'begin_area'?: IArea
  'end_area'?: IArea
  'genres'?: IGenre[]
  'tags'?: IArtistTag[]
  'rating'?: IRating
  'releases'?: IRelease[]
  'release-groups'?: IReleaseGroup[]
}
