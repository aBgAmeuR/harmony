import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Clean reset for packages + dependent interactions table
    this.schema.dropTableIfExists('interactions')
    this.schema.dropTableIfExists('packages')

    this.schema.createTable('packages', (table) => {
      table.increments('id')
      table.string('public_id', 12).notNullable()
      table.string('file_name', 255).notNullable()
      table.integer('file_size').notNullable()
      table.string('status', 50).notNullable()
      table.json('data').notNullable().defaultTo('{}')
      table.timestamp('created_at').notNullable().defaultTo(this.now())

      table.unique(['public_id'], { indexName: 'packages_public_id_unique' })
      table.index(['public_id'], 'packages_public_id_index')
    })

    this.schema.createTable('interactions', (table) => {
      table.integer('package_id').notNullable().unsigned().references('id').inTable('packages')
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
      table.index(['package_id', 'timestamp'], 'interactions_package_id_timestamp_index')
    })
  }

  async down() {
    this.schema.dropTableIfExists('interactions')
    this.schema.dropTableIfExists('packages')

    this.schema.createTable('packages', (table) => {
      table.uuid('id').primary()
      table.string('file_name', 255).notNullable()
      table.integer('file_size').notNullable()
      table.string('status', 50).notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
    })

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
  }
}
