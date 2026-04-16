import type { IEntity } from './core.js'
import type { IArtistCredit } from './artist-credit.js'
import type { IRecording } from './recording.js'

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
