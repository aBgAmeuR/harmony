import { IEntity } from './shared/core.js'
import { IRecording } from './recording.js'
import { IArtistCredit } from './artist.js';

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
