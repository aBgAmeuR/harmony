export interface IEntity {
  id: string
}

export interface ITypedEntity extends IEntity {
  'type-id': string
  'type': string
}

export interface LifeSpan {
  ended: boolean
  begin: null | string
  end: null | string
}

export interface IPeriod {
  begin: string
  ended: boolean
  end: string
}

export interface IMatch {
  score: number
}

export interface ISearchResult {
  created: string
  count: number
  offset: number
}

export interface ITag {
  name: string
}

export interface IUserVote {
  count: number
}

export type IArtistTag = ITag & IUserVote

export interface IRating {
  'value': number | null
  'votes-count': number
}

export interface IGenre extends IEntity, IUserVote {
  name: string
  disambiguation: string
}

export interface IArea extends ITypedEntity {
  'iso-3166-1-codes'?: string[]
  'name': string
  'sort-name': string
  'disambiguation': string
  'life-span'?: LifeSpan
}

export interface IAlias extends ITypedEntity {
  'name': string
  'sort-name': string
  'ended': boolean
  'locale': string
  'primary': string
  'begin': string
  'end': string
}

export interface IUrl extends IEntity {
  id: string
  resource: string
}

export type RelationDirection = 'backward' | 'forward'

export interface IReleaseEvent {
  area?: IArea
  date?: string
}

export type ReleaseStatus =
  | 'Official'
  | 'Promotion'
  | 'Bootleg'
  | 'Pseudo-release'
  | 'Withdrawn'
  | 'Expunged'
  | 'Cancelled'

export type ReleasePackaging =
  | 'Book'
  | 'Box'
  | 'Cardboard/Paper Sleeve'
  | 'Cassette Case'
  | 'Clamshell Case'
  | 'Digibook'
  | 'Digifile'
  | 'Digipak'
  | 'Jewel case'
  | 'Other'
  | 'None'

export interface ICoverArtArchive {
  count: number
  front: boolean
  darkened: boolean
  artwork: boolean
  back: boolean
}
