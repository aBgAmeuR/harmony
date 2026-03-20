import { strFromU8 } from 'fflate'
import { type UploadStage } from '../upload_stage.ts'
import { type UploadContext } from '../upload_context.ts'
import { listeningInteractionValidator } from '#validators/packages'

export class ParseInteractionsStage implements UploadStage {
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
  }
}
