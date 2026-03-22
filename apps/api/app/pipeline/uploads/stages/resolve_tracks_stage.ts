import { inject } from '@adonisjs/core'
import Track from '#models/track'
import { type UploadContext } from '../upload_context.ts'
import { type UploadStage } from '../upload_stage.ts'

@inject()
export class ResolveTracksStage implements UploadStage {
  async handle(context: UploadContext, next: () => Promise<void>) {
    for (const [keyStr, key] of context.trackCatalogue.entries()) {
      const existing = await Track.findByKey(key)
      if (existing) {
        context.trackKeyToId.set(keyStr, existing.id)
      } else {
        const track = await Track.findByKey({ artist: key.artist, track: key.track, album: null })
        if (track) {
          context.trackKeyToId.set(keyStr, track.id)
        }
      }
    }

    await next()
  }
}
