import { inject } from '@adonisjs/core'
import Interaction, { type InteractionRow } from '#models/interaction'
import { type UploadContext } from '../upload_context.ts'
import { type UploadStage } from '../upload_stage.ts'

const BATCH_SIZE = 500

@inject()
export class PersistInteractionsStage implements UploadStage {
  async handle(context: UploadContext, next: () => Promise<void>) {
    const interactions = context.normalizedInteractions
    if (!interactions) {
      await next()
      return
    }

    const packageId = context.upload.id
    const batch: InteractionRow[] = []

    for await (const item of interactions) {
      context.stats.totalInteractions += 1
      const trackId = context.trackKeyToId.get(item.trackKey)
      if (trackId === undefined) {
        context.stats.skippedInteractions.count += 1
        context.stats.skippedInteractions.msPlayed += item.msPlayed
        continue
      }

      batch.push({
        trackId,
        timestamp: item.ts,
        msPlayed: item.msPlayed,
        platform: item.platform,
        reasonStart: item.reasonStart,
        reasonEnd: item.reasonEnd,
        shuffle: item.shuffle,
        skipped: item.skipped,
        offline: item.offline,
      })

      if (batch.length >= BATCH_SIZE) {
        await Interaction.saveBatch(packageId, batch)
        batch.length = 0
      }
    }

    if (batch.length > 0) {
      await Interaction.saveBatch(packageId, batch)
    }

    await next()
  }
}
