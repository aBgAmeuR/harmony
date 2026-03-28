import type { IEntity } from './core.js'
import type { IAlias } from './core.js'
import type { IMatch } from './core.js'
import type { IArtistCredit } from './artist-credit.js'
import type { IMayHaveRelations } from './relations.js'
import type { IRelease } from './release.js'

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

export type IRecordingMatch = IRecording & IMatch

export interface ISearchResult {
  created: string
  count: number
  offset: number
}

export interface IRecordingList extends ISearchResult {
  'recordings': IRecordingMatch[]
  'recordings-count'?: number
}
