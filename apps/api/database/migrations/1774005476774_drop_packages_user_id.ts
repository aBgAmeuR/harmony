import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.table('packages', (table) => {
      table.dropColumn('user_id')
    })
  }

  async down() {
    this.schema.table('packages', (table) => {
      table.integer('user_id').unsigned().nullable()
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')
    })
  }
}
