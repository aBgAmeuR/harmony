import { PackageSchema } from '#database/schema'
import type { UploadDataPayload } from '#services/uploads/upload_package_types'

export default class Package extends PackageSchema {
  declare data: UploadDataPayload | null
}
