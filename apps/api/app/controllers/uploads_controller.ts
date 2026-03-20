import Package from '#models/package'
import { UploadPackageService } from '#services/uploads/upload_package_service'
import { uploadPackageValidator } from '#validators/packages'
import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class UploadsController {
  constructor(private uploadPackageService: UploadPackageService) {}

  async upload({ request }: HttpContext) {
    const payload = await request.validateUsing(uploadPackageValidator)

    const upload = await Package.create({
      fileName: payload.file.clientName,
      fileSize: payload.file.size,
      status: 'pending',
    })

    this.uploadPackageService
      .execute(upload, payload.file, payload.json_files)
      .catch((err) => logger.error({ err, upload }, 'Upload processing failed'))

    return {
      uploadId: upload.id,
      status: 'pending',
      message: 'Upload started',
    }
  }
}
