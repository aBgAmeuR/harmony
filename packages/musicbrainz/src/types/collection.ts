import type { ITypedEntity } from './core.js'

export interface ICollection extends ITypedEntity {
  'type': string
  'name': string
  'recording-count': number
  'editor': string
  'entity-type': string
}
