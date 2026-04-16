import TrackService from '#services/track_service'
import { trackParamsValidator } from '#validators/instant_range_query'
import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'

@inject()
export default class TracksController {
  constructor(private readonly trackService: TrackService) {}

  async top({ pkg, instantRange }: HttpContext) {
    const tracks = await this.trackService.getTopTracks(pkg.id, instantRange)
    return { packageId: pkg.publicId, tracks }
  }

  async get({ params, pkg, instantRange, request, response }: HttpContext) {
    const { trackId } = await request.validateUsing(trackParamsValidator, { data: params })

    const details = await this.trackService.getTrackDetails(pkg.id, trackId, instantRange)
    if (!details) {
      return response.notFound({ message: 'Track not found' })
    }

    return { details }
  }
}
