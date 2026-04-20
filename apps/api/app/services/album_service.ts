import type { TopAlbumDto } from '#dtos/album_dtos'
import { msToMinutes } from '#lib/time_utils'
import { type InstantRange } from '#services/interaction_timestamp_range'
import Album from '#models/album'
import db from '@adonisjs/lucid/services/db'

export default class AlbumService {
  async getTopAlbums(packageId: number, range: InstantRange): Promise<TopAlbumDto[]> {
    const query = Album.query()
      .select([
        'albums.*',
        db.raw('coalesce(sum(interactions.ms_played), 0)::bigint as listening_ms'),
        db.raw('count(interactions.*)::int as streams'),
        db.raw(
          "coalesce(string_agg(distinct artists.name, ', ' order by artists.name), '') as artist_names"
        ),
      ])
      .join('tracks', 'albums.id', 'tracks.album_id')
      .join('interactions', 'interactions.track_id', 'tracks.id')
      .leftJoin('album_artists', 'album_artists.album_id', 'albums.id')
      .leftJoin('artists', 'artists.id', 'album_artists.artist_id')
      .where('interactions.package_id', packageId)
      .groupBy('albums.id')
      .orderByRaw('sum(interactions.ms_played) desc')
      .limit(50)

    if (range.from) {
      query.where('interactions.timestamp', '>=', range.from.toJSDate())
    }
    if (range.to) {
      query.where('interactions.timestamp', '<=', range.to.toJSDate())
    }

    const albums = await query

    return albums.map((album) => ({
      id: album.id,
      name: album.name,
      description: String(album.$extras.artist_names ?? ''),
      image: album.image,
      streams: Number(album.$extras.streams ?? 0),
      playtime: msToMinutes(Number(album.$extras.listening_ms ?? 0)),
    }))
  }
}
