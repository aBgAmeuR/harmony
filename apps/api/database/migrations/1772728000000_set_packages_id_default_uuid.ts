import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.schema.raw('ALTER TABLE "packages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()')
  }

  async down() {
    await this.schema.raw('ALTER TABLE "packages" ALTER COLUMN "id" DROP DEFAULT')
  }
}
