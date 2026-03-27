/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import transmit from '@adonisjs/transmit/services/main'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    transmit.registerRoutes()

    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.post('/package', [controllers.Uploads, 'upload'])
        router.get('/:uploadId/stats', [controllers.Uploads, 'stats'])
      })
      .prefix('uploads')
      .as('uploads')

    router
      .group(() => {
        router.get('/:id', [controllers.Package, 'show'])
        router.get('/:id/stats', [controllers.Package, 'stats'])
        router.get('/:id/tracks', [controllers.Tracks, 'top'])
        router.delete('/:id', [controllers.Package, 'destroy'])
      })
      .prefix('package')
      .as('package')
      .use(middleware.bindPackage())
  })
  .prefix('/api/v1')
