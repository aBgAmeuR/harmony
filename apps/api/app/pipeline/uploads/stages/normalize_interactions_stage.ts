import {
  normalizeAlbumName,
  normalizeArtistName,
  normalizeTrackName,
} from '#services/normalization/track_text_normalizer'
import { normalizePlatform } from '#services/normalization/platform_normalizer'
import { inject } from '@adonisjs/core'
import { type NormalizedListeningInteraction, type UploadContext } from '../upload_context.ts'
import { type UploadStage } from '../upload_stage.ts'
import { UploadProgressBroadcaster } from '../upload_progress_broadcaster.ts'

@inject()
export class NormalizeInteractionsStage implements UploadStage {
  constructor(private broadcaster: UploadProgressBroadcaster) {}

  async handle(context: UploadContext, next: () => Promise<void>) {
    if (!context.rawInteractions) return

    const buffer: NormalizedListeningInteraction[] = []
    let rejectedCount = 0
    let keptCount = 0
    for await (const raw of context.rawInteractions) {
      if (
        !raw ||
        raw.ms_played <= 30_000 ||
        !raw.master_metadata_track_name ||
        !raw.master_metadata_album_album_name ||
        !raw.master_metadata_album_artist_name
      ) {
        rejectedCount += 1
        continue
      }

      const cleanTrackName = normalizeTrackName(raw.master_metadata_track_name)
      const cleanAlbumName = normalizeAlbumName(raw.master_metadata_album_album_name)
      const cleanArtistName = normalizeArtistName(raw.master_metadata_album_artist_name)

      const trackKey = `${cleanArtistName}-${cleanAlbumName}-${cleanTrackName}`
      context.trackCatalogue.set(trackKey, {
        artist: cleanArtistName,
        track: cleanTrackName,
        album: cleanAlbumName,
      })

      buffer.push({
        trackKey,
        ts: raw.ts,
        platform: normalizePlatform(raw.platform),
        msPlayed: raw.ms_played,
        reasonStart: raw.reason_start,
        reasonEnd: raw.reason_end,
        shuffle: raw.shuffle ?? false,
        skipped: raw.skipped ?? false,
        offline: raw.offline ?? false,
      })
      keptCount += 1
    }

    context.normalizedInteractions = (async function* () {
      for (const item of buffer) yield item
    })()

    this.broadcaster.updateNormalizeCounts(context.upload.publicId, {
      rejectedCount,
      keptCount,
    })

    await next()
  }
}
