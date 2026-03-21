import { strFromU8 } from 'fflate'
import { type UploadStage } from '../upload_stage.ts'
import { type UploadContext } from '../upload_context.ts'
import { listeningInteractionValidator } from '#validators/packages'
import { inject } from '@adonisjs/core'
import { UploadProgressBroadcaster } from '../upload_progress_broadcaster.ts'

@inject()
export class ParseInteractionsStage implements UploadStage {
  constructor(private broadcaster: UploadProgressBroadcaster) {}

  async handle(context: UploadContext, next: () => Promise<void>) {
    let invalidInteractions = 0
    let validatedInteractions = 0

    async function* stream() {
      for (const file of context.filesInArchive) {
        const contentStr = strFromU8(file.content)
        const jsonData = JSON.parse(contentStr)

        const items = Array.isArray(jsonData) ? jsonData : [jsonData]

        for (const item of items) {
          const result = await contextParseValidate(item)
          if (!result.ok) {
            invalidInteractions++
            continue
          }
          validatedInteractions++
          yield result.value
        }
      }
    }

    const contextParseValidate = async (item: unknown) => {
      try {
        const value = await listeningInteractionValidator.validate(item)
        return { ok: true, value }
      } catch {
        return { ok: false }
      }
    }

    context.rawInteractions = stream()
    await next()

    this.broadcaster.updateParseCounts(context.upload.publicId, {
      invalidCount: invalidInteractions,
      validatedCount: validatedInteractions,
    })
  }
}
