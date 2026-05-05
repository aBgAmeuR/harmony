import { IArtistCredit } from './artist.js'
import type { IMayHaveRelations } from './relations.js'
import type { IRelease } from './release.js'
import { IAlias, IEntity, IMatch, ISearchResult } from './shared/core.js'

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

export interface IRecordingList extends ISearchResult {
  'recordings': IRecordingMatch[]
  'recordings-count'?: number
}
