import Package from '#models/package'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    /**
     * Set by `bindPackage` middleware on `/package/:id/*` routes only.
     */
    pkg: Package
  }
}

export default class BindPackageMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const pkg = await Package.findBy('publicId', ctx.params.id)
    if (!pkg) {
      return ctx.response.notFound({ message: 'Package not found' })
    }

    ctx.pkg = pkg
    return next()
  }
}
