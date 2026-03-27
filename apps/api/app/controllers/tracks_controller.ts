import Track from '#models/track'
import { applyInteractionTimestampRange } from '#services/interaction_timestamp_range'
import {
  assertInstantRangeOrder,
  instantRangeQueryValidator,
} from '#validators/instant_range_query'
import { type HttpContext } from '@adonisjs/core/http'

export default class TracksController {
  async top({ pkg, request }: HttpContext) {
    const range = await request.validateUsing(instantRangeQueryValidator, {
      data: request.qs(),
    })
    assertInstantRangeOrder(range.from, range.to)

    const tracks = await Track.query()
      .whereHas('interactions', (q) => {
        q.where('packageId', pkg.id)
        applyInteractionTimestampRange(q, range)
      })
      .withAggregate('interactions', (q) => {
        q.where('packageId', pkg.id)
        applyInteractionTimestampRange(q, range)
        q.sum('ms_played').as('listening_ms')
      })
      .withCount('interactions', (q) => {
        q.where('packageId', pkg.id)
        applyInteractionTimestampRange(q, range)
        q.as('streams')
      })
      .preload('album')
      .preload('artists')
      .orderBy('listening_ms', 'desc')
      .limit(50)

    return {
      packageId: pkg.publicId,
      tracks: tracks.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.artists
          .map((a) => a.name)
          .sort()
          .join(', '),
        image: row.album?.image ?? null,
        streams: Number(row.$extras.streams ?? 0),
        playtime: Number(row.$extras.listening_ms ?? 0) / 60000,
      })),
    }
  }
}
