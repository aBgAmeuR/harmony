import type { SearchRecordingParams } from '@harmony/musicbrainz'
import { type MetadataSearchResult, type MetadataSearchVariant } from './metadata_search_variant.ts'
import { inject } from '@adonisjs/core'
import { AmpersandWithAlbumVariant } from './variants/ampersand_with_album_variant.ts'
import { AmpersandWithoutAlbumVariant } from './variants/ampersand_without_album_variant.ts'
import { WithAlbumVariant } from './variants/with_album_variant.ts'
import { WithoutAlbumVariant } from './variants/without_album_variant.ts'
import logger from '@adonisjs/core/services/logger'

@inject()
export class TrackMetadataSearchPipeline {
  private readonly variants: MetadataSearchVariant[]

  constructor(
    private ampersandWithAlbumVariant: AmpersandWithAlbumVariant,
    private ampersandWithoutAlbumVariant: AmpersandWithoutAlbumVariant,
    private withAlbumVariant: WithAlbumVariant,
    private withoutAlbumVariant: WithoutAlbumVariant
  ) {
    this.variants = [
      this.ampersandWithAlbumVariant,
      this.ampersandWithoutAlbumVariant,
      this.withAlbumVariant,
      this.withoutAlbumVariant,
    ]
  }

  async search(params: SearchRecordingParams): Promise<MetadataSearchResult> {
    logger.debug(params, '[MUSICBRAINZ] Searching')

    for (const variant of this.variants) {
      if (!variant.canHandle(params)) continue

      const recordings = await variant.search(params)
      if (recordings.recordings.length > 0) {
        return { metadata: recordings }
      }
    }

    return {
      metadata: {
        created: '',
        count: 0,
        offset: 0,
        recordings: [],
      },
    }
  }
}
