import Package from '#models/package'
import { type HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PackageController {
  async show({ params, response }: HttpContext) {
    const pkg = await Package.findBy('publicId', params.id)
    if (!pkg) {
      return response.notFound({ message: 'Package not found' })
    }

    return {
      id: pkg.publicId,
      fileName: pkg.fileName,
      fileSize: pkg.fileSize,
      status: pkg.status,
      createdAt: pkg.createdAt,
    }
  }

  async stats({ params, response }: HttpContext) {
    const pkg = await Package.findBy('publicId', params.id)
    if (!pkg) {
      return response.notFound({ message: 'Package not found' })
    }

    return pkg.data
  }

  async destroy({ params, response }: HttpContext) {
    const pkg = await Package.findBy('publicId', params.id)
    if (!pkg) {
      return response.notFound({ message: 'Package not found' })
    }

    await db.transaction(async (trx) => {
      await trx.from('interactions').where('package_id', pkg.id).delete()
      await pkg.useTransaction(trx).delete()
    })

    return response.ok({ deleted: true })
  }
}
