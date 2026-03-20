import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    /**
     * packages
     */
    this.schema.createTable('packages', (table) => {
      table.uuid('id').primary()
      table.string('file_name', 255).notNullable()
      table.integer('file_size').notNullable()
      table.string('status', 50).notNullable()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users')

      table.timestamp('created_at').notNullable().defaultTo(this.now())
    })

    /**
     * artists
     */
    this.schema.createTable('artists', (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('image').nullable()
      table.string('external_id', 255).notNullable()

      table.unique(['external_id'], { indexName: 'artists_external_id_unique' })
    })

    /**
     * albums
     */
    this.schema.createTable('albums', (table) => {
      table.increments('id')
      table
        .enu('type', ['album', 'single'], {
          useNative: true,
          enumName: 'album_type',
          existingType: false,
        })
        .notNullable()
      table.string('name', 255).notNullable()
      table.string('image').nullable()
      table.integer('total_tracks').notNullable()
      table.string('release_date', 50).notNullable()
      table.string('external_id', 255).notNullable()

      table.unique(['external_id'], { indexName: 'albums_external_id_unique' })
    })

    /**
     * tracks
     */
    this.schema.createTable('tracks', (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.integer('ms_duration').nullable()
      table.integer('track_number').nullable()
      table.integer('album_id').notNullable().unsigned().references('id').inTable('albums')
      table.string('external_id', 255).notNullable()

      table.unique(['external_id'], { indexName: 'tracks_external_id_unique' })
    })

    /**
     * interactions
     */
    this.schema.createTable('interactions', (table) => {
      table.uuid('package_id').notNullable().references('id').inTable('packages')
      table.integer('track_id').notNullable().unsigned().references('id').inTable('tracks')
      table.timestamp('timestamp').notNullable()
      table.integer('ms_played').notNullable()
      table.string('platform', 50).nullable()
      table.string('reason_start', 50).nullable()
      table.string('reason_end', 50).nullable()
      table.boolean('shuffle').nullable()
      table.boolean('skipped').nullable()
      table.boolean('offline').nullable()

      table.primary(['package_id', 'timestamp'])
    })

    /**
     * album_artists
     */
    this.schema.createTable('album_artists', (table) => {
      table.integer('album_id').notNullable().unsigned().references('id').inTable('albums')
      table.integer('artist_id').notNullable().unsigned().references('id').inTable('artists')

      table.primary(['album_id', 'artist_id'])
    })

    /**
     * track_artists
     */
    this.schema.createTable('track_artists', (table) => {
      table.integer('track_id').notNullable().unsigned().references('id').inTable('tracks')
      table.integer('artist_id').notNullable().unsigned().references('id').inTable('artists')

      table.primary(['track_id', 'artist_id'])
    })
  }

  async down() {
    this.schema.dropTable('track_artists')
    this.schema.dropTable('album_artists')
    this.schema.dropTable('interactions')
    this.schema.dropTable('tracks')
    this.schema.dropTable('albums')
    this.schema.dropTable('artists')
    this.schema.dropTable('packages')

    this.schema.raw('DROP TYPE IF EXISTS "album_type"')
  }
}
