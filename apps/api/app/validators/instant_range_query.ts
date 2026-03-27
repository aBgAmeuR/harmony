import { type DateTime } from 'luxon'
import vine, { ValidationError } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const instantRangeQueryValidator = vine.create({
  from: vine.date().optional(),
  to: vine.date().optional(),
})

export type InstantRangeQuery = Infer<typeof instantRangeQueryValidator>

export function assertInstantRangeOrder(
  from: DateTime | undefined,
  to: DateTime | undefined
): void {
  if (from && to && from > to) {
    throw new ValidationError({
      to: ['The "to" instant must be greater than or equal to "from".'],
    })
  }
}
