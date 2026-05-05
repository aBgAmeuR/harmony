import { IMayHaveRelations } from './relations.js'
import type { IReleaseGroup } from './release-group.js'
import { IRelease } from './release.js'
import { IAlias, IArea, IArtistTag, IGenre, IPeriod, IRating, ITypedEntity } from './shared/core.js'

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

export interface IArtistCredit {
  artist: IArtist
  joinphrase: string
  name: string
}
