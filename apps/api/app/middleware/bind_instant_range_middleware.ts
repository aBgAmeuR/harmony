import type { InstantRange } from '#services/interaction_timestamp_range'
import {
  assertInstantRangeOrder,
  instantRangeQueryValidator,
} from '#validators/instant_range_query'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    /**
     * Set by `bindInstantRange` middleware.
     * Validated `from`/`to` DateTime bounds from query string.
     */
    instantRange: InstantRange
  }
}

export default class BindInstantRangeMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const range = await ctx.request.validateUsing(instantRangeQueryValidator, {
      data: ctx.request.qs(),
    })
    assertInstantRangeOrder(range.from, range.to)

    ctx.instantRange = range
    return next()
  }
}
