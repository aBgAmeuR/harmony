import Album from '#models/album'
import Track from '#models/track'
import { ArtistSchema } from '#database/schema'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Artist extends ArtistSchema {
  @manyToMany(() => Track, {
    pivotTable: 'track_artists',
    pivotForeignKey: 'artist_id',
    pivotRelatedForeignKey: 'track_id',
  })
  declare tracks: ManyToMany<typeof Track>

  @manyToMany(() => Album, {
    pivotTable: 'album_artists',
    pivotForeignKey: 'artist_id',
    pivotRelatedForeignKey: 'album_id',
  })
  declare albums: ManyToMany<typeof Album>
}
