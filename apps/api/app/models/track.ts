import Album from '#models/album'
import Artist from '#models/artist'
import Interaction from '#models/interaction'
import db from '@adonisjs/lucid/services/db'
import { TrackSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Track extends TrackSchema {
  @belongsTo(() => Album, { foreignKey: 'albumId' })
  declare album: BelongsTo<typeof Album>

  @hasMany(() => Interaction)
  declare interactions: HasMany<typeof Interaction>

  @manyToMany(() => Artist, {
    pivotTable: 'track_artists',
    pivotForeignKey: 'track_id',
    pivotRelatedForeignKey: 'artist_id',
  })
  declare artists: ManyToMany<typeof Artist>

  static async findByKey(key: {
    artist: string
    track: string
    album: string | null
  }): Promise<Track | null> {
    if (key.album === null) {
      const row = await db
        .from('tracks')
        .select('tracks.id')
        .innerJoin('track_artists', 'tracks.id', 'track_artists.track_id')
        .innerJoin('artists', 'artists.id', 'track_artists.artist_id')
        .where('tracks.name', key.track)
        .where('artists.name', key.artist)
        .first()

      if (!row) return null
      return await Track.find(row.id)
    }

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
