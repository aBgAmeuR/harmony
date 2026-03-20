import type Package from '#models/package'
import { inject } from '@adonisjs/core'
import { type MultipartFile } from '@adonisjs/core/bodyparser'
import { type UploadContext } from '../../pipeline/uploads/upload_context.ts'
import { UploadPipeline } from '../../pipeline/uploads/upload_pipeline.ts'
import { UploadProgressBroadcaster } from '../../pipeline/uploads/upload_progress_broadcaster.ts'

@inject()
export class UploadPackageService {
  constructor(
    private pipeline: UploadPipeline,
    private broadcaster: UploadProgressBroadcaster
  ) {}

  async execute(upload: Package, file: MultipartFile, jsonFiles: string[] = []) {
    const context: UploadContext = {
      upload,
      file,
      selectedJsonFiles: jsonFiles,
      filesInArchive: [],
      rawInteractions: null,
      normalizedInteractions: null,
      trackCatalogue: new Map(),
      trackKeyToId: new Map(),
      stats: {
        totalInteractions: 0,
        skippedInteractions: { count: 0, msPlayed: 0 },
        skippedTracks: [],
      },
    }

    try {
      await upload.merge({ status: 'running' }).save()
      this.broadcaster.initialize(upload.id)

      await this.pipeline.run(context)
      await upload.merge({ status: 'completed' }).save()
    } catch (error) {
      await upload.merge({ status: 'failed' }).save()
      throw error
    }
  }
}
