import db from '@adonisjs/lucid/services/db'
import { TrackSchema } from '#database/schema'

export default class Track extends TrackSchema {
  static async findByKey(key: {
    artist: string
    track: string
    album: string
  }): Promise<Track | null> {
    const row = await db
      .from('tracks')
      .select('tracks.id')
      .innerJoin('albums', 'tracks.album_id', 'albums.id')
      .innerJoin('track_artists', 'tracks.id', 'track_artists.track_id')
      .innerJoin('artists', 'artists.id', 'track_artists.artist_id')
      .where('tracks.name', key.track)
      .where('albums.name', key.album)
      .where('artists.name', key.artist)
      .first()

    if (!row) return null
    return await Track.find(row.id)
  }
}
