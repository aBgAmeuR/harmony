import type Interaction from '#models/interaction'
import type db from '@adonisjs/lucid/services/db'
import type { DateTime } from 'luxon'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export type InstantRange = {
  from?: DateTime
  to?: DateTime
}

/**
 * Applies `interactions.timestamp` bounds for Lucid `Interaction` query builders
 * (relation subqueries, `Interaction.query()`, etc.).
 */
export function applyInteractionTimestampRange(
  query: ModelQueryBuilderContract<typeof Interaction, any>,
  range: InstantRange
): void {
  if (range.from) {
    query.where('timestamp', '>=', range.from.toJSDate())
  }
  if (range.to) {
    query.where('timestamp', '<=', range.to.toJSDate())
  }
}

/**
 * Applies `interactions.timestamp` bounds for raw Knex query builders
 * returned by `db.from()`.
 */
export function applyInstantRangeToRawQuery(
  query: ReturnType<typeof db.from>,
  range: InstantRange
): void {
  if (range.from) {
    query.where('timestamp', '>=', range.from.toJSDate())
  }
  if (range.to) {
    query.where('timestamp', '<=', range.to.toJSDate())
  }
}
