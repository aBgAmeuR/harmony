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

export interface IArtistCredit {
  artist: IArtist
  joinphrase: string
  name: string
}

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

export interface IRecording extends IEntity, IMayHaveRelations {
  'video': boolean | null
  'length': number
  'title': string
  'disambiguation': string
  'isrcs'?: string[]
  'releases'?: IRelease[]
  'artist-credit'?: IArtistCredit[]
  'aliases'?: IAlias[]
  'first-release-date': string
}

export interface ITrack extends IEntity {
  'position': number
  'recording': IRecording
  'number': string
  'length': number
  'title': string
  'artist-credit'?: IArtistCredit[]
}

export interface IMedium {
  'title': string
  'format'?: string
  'format-id': string
  'tracks': ITrack[]
  'track-count': number
  'track-offset': number
  'position': number
}

export interface IReleaseGroup extends IEntity {
  'count'?: number
  'disambiguation'?: string
  'title': string
  'secondary-types'?: string[]
  'first-release-date': string
  'primary-type': string
  'primary-type-id'?: string
  'artist-credit'?: { artist: IArtist; name: string; joinphrase: string }[]
  'releases'?: IRelease[]
}

export interface ICollection extends ITypedEntity {
  'type': string
  'name': string
  'recording-count': number
  'editor': string
  'entity-type': string
}

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

export interface ISearchResult {
  created: string
  count: number
  offset: number
}

export type IRecordingMatch = IRecording & IMatch

export interface IRecordingList extends ISearchResult {
  'recordings': IRecordingMatch[]
  'recordings-count'?: number
}
