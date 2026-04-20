import AlbumService from '#services/album_service'
import { instantRangeQueryValidator } from '#validators/instant_range_query'
import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'

@inject()
export default class AlbumsController {
  constructor(private readonly albumService: AlbumService) {}

  async top({ request, pkg, instantRange }: HttpContext) {
    await request.validateUsing(instantRangeQueryValidator)
    const albums = await this.albumService.getTopAlbums(pkg.id, instantRange)
    return { packageId: pkg.publicId, albums }
  }
}
