import type { IRecording } from '@harmony/musicbrainz'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import Album from '#models/album'
import Artist from '#models/artist'
import Track from '#models/track'
import { TrackMetadataSearchPipeline } from '#services/enrichment/metadata_search/track_metadata_search_pipeline'
import {
  parseMbRecording,
  pickBestRelease,
  type ParsedRecording,
} from '#services/enrichment/parsed_recording'
import { retryWithBackoff } from '../../../utils/retry_with_backoff.ts'
import { type TrackKey, type UploadContext } from '../upload_context.ts'
import { type UploadStage } from '../upload_stage.ts'
import {
  UploadProgressBroadcaster,
  type EnrichTracksStepData,
} from '../upload_progress_broadcaster.ts'
import logger from '@adonisjs/core/services/logger'

function pickRecording(recordings: IRecording[]) {
  return recordings.find((r) => !r.disambiguation || r.disambiguation === 'explicit') ?? null
}

@inject()
export class EnrichTracksStage implements UploadStage {
  constructor(
    private trackMetadataSearchPipeline: TrackMetadataSearchPipeline,
    private broadcaster: UploadProgressBroadcaster
  ) {}

  async handle(context: UploadContext, next: () => Promise<void>) {
    const uploadId = context.upload.publicId
    const tracksToProcess = context.trackCatalogue.size
    let tracksProcessed = 0
    let tracksSkipped = 0
    let lastBroadcastAt = 0

    this.broadcaster.updateEnrichProgress(uploadId, {
      tracksToProcess,
      tracksProcessed,
      tracksSkipped,
    })
    lastBroadcastAt = Date.now()

    const broadcastIfNeeded = () => {
      const now = Date.now()
      if (now - lastBroadcastAt < 1000) return
      lastBroadcastAt = now
      const data: EnrichTracksStepData = {
        tracksToProcess,
        tracksProcessed,
        tracksSkipped,
      }
      this.broadcaster.updateEnrichProgress(uploadId, data)
    }

    const keysToEnrich: { keyStr: string; key: TrackKey }[] = []

    for (const [keyStr, key] of context.trackCatalogue.entries()) {
      if (context.trackKeyToId.has(keyStr)) {
        tracksProcessed += 1
        continue
      }
      keysToEnrich.push({ keyStr, key })
    }

    await Promise.all(
      keysToEnrich.map(({ keyStr, key }) =>
        (async () => {
          try {
            await this.processOneKey(
              keyStr,
              key,
              context,
              () => {
                tracksProcessed += 1
              },
              () => {
                tracksSkipped += 1
                context.stats.skippedTracksCount += 1
              }
            )
          } catch (err) {
            tracksSkipped += 1
            context.stats.skippedTracksCount += 1
            logger.warn({ err, key }, 'Enrich track failed after retries; skipping key')
          }
          broadcastIfNeeded()
        })()
      )
    )

    this.broadcaster.updateEnrichProgress(uploadId, {
      tracksToProcess,
      tracksProcessed,
      tracksSkipped,
    })

    context.stats.processedTracksCount = tracksProcessed

    await next()
  }

  private async processOneKey(
    keyStr: string,
    key: TrackKey,
    context: UploadContext,
    onPersisted: () => void,
    onSkipped: () => void
  ): Promise<void> {
    const { metadata } = await retryWithBackoff(() =>
      this.trackMetadataSearchPipeline.search({
        artist: key.artist,
        recording: key.track,
        release: key.album,
      })
    )

    const recording = pickRecording(metadata.recordings)
    if (!recording) {
      onSkipped()
      logger.debug(key, 'No recording found for')
      return
    }

    const release = pickBestRelease(recording.releases)
    if (!release) {
      onSkipped()
      logger.debug(key, 'No release found for')
      return
    }

    const parsed = parseMbRecording(recording, release)
    if (!parsed) {
      onSkipped()
      logger.debug(key, 'No parsed recording found for')
      return
    }

    const trackId = await this.persistParsedRecording(parsed)
    if (trackId !== null) {
      context.trackKeyToId.set(keyStr, trackId)
      onPersisted()
    } else {
      onSkipped()
      logger.debug(key, 'No track id found for')
    }
  }

  private async persistParsedRecording(parsed: ParsedRecording) {
    return await db.transaction(async (trx) => {
      const artistIds: number[] = []
      for (let i = 0; i < parsed.artistMbids.length; i++) {
        const mbid = parsed.artistMbids[i]!
        const name = parsed.artistNames[i] ?? ''
        const artist = await Artist.firstOrCreate(
          { externalId: mbid },
          { name, image: null, externalId: mbid },
          { client: trx }
        )
        artistIds.push(artist.id)
      }

      const album = await Album.firstOrCreate(
        { externalId: parsed.albumExternalId },
        {
          type: parsed.albumType,
          name: parsed.albumName,
          image: null,
          totalTracks: parsed.albumTotalTracks,
          releaseDate: parsed.albumReleaseDate,
          externalId: parsed.albumExternalId,
        },
        { client: trx }
      )

      const track = await Track.firstOrCreate(
        { externalId: parsed.trackExternalId },
        {
          name: parsed.trackName,
          msDuration: parsed.trackMsDuration,
          trackNumber: parsed.trackNumber,
          albumId: album.id,
          externalId: parsed.trackExternalId,
        },
        { client: trx }
      )

      const albumArtistRows = artistIds.map((artistId) => ({
        album_id: album.id,
        artist_id: artistId,
      }))
      await trx
        .knexClient('album_artists')
        .insert(albumArtistRows)
        .onConflict(['album_id', 'artist_id'])
        .ignore()

      const trackArtistRows = artistIds.map((artistId) => ({
        track_id: track.id,
        artist_id: artistId,
      }))
      await trx
        .knexClient('track_artists')
        .insert(trackArtistRows)
        .onConflict(['track_id', 'artist_id'])
        .ignore()

      return track.id
    })
  }
}
