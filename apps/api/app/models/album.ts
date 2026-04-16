import Artist from '#models/artist'
import Track from '#models/track'
import { AlbumSchema } from '#database/schema'
import { hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Album extends AlbumSchema {
  @hasMany(() => Track)
  declare tracks: HasMany<typeof Track>

  @manyToMany(() => Artist, {
    pivotTable: 'album_artists',
    pivotForeignKey: 'album_id',
    pivotRelatedForeignKey: 'artist_id',
  })
  declare artists: ManyToMany<typeof Artist>
}
