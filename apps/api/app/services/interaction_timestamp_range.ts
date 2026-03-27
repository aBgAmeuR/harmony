import type Interaction from '#models/interaction'
import type { DateTime } from 'luxon'
import type { RelationSubQueryBuilderContract } from '@adonisjs/lucid/types/relations'

export type InstantRange = {
  from?: DateTime
  to?: DateTime
}

/**
 * Applies `interactions.timestamp` bounds for Lucid `Interaction` query builders.
 * For raw `db.from('interactions')` chains, add a sibling helper when a caller needs it.
 */
export function applyInteractionTimestampRange(
  query: RelationSubQueryBuilderContract<typeof Interaction>,
  range: InstantRange
): void {
  if (range.from) {
    query.where('timestamp', '>=', range.from.toJSDate())
  }
  if (range.to) {
    query.where('timestamp', '<=', range.to.toJSDate())
  }
}
