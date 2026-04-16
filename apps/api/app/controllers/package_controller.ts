import { type HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PackageController {
  async show({ pkg }: HttpContext) {
    return {
      id: pkg.publicId,
      fileName: pkg.fileName,
      fileSize: pkg.fileSize,
      status: pkg.status,
      createdAt: pkg.createdAt,
    }
  }

  async stats({ pkg }: HttpContext) {
    return pkg.data
  }

  async destroy({ pkg, response }: HttpContext) {
    await db.transaction(async (trx) => {
      await trx.from('interactions').where('package_id', pkg.id).delete()
      await pkg.useTransaction(trx).delete()
    })

    return response.ok({ deleted: true })
  }
}
