import Interaction from '#models/interaction'
import { PackageSchema } from '#database/schema'
import type { UploadDataPayload } from '#services/uploads/upload_package_types'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Package extends PackageSchema {
  declare data: UploadDataPayload | null

  @hasMany(() => Interaction)
  declare interactions: HasMany<typeof Interaction>
}
