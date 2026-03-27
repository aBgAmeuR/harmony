import { defineConfig } from '@adonisjs/otel'
import env from '#start/env'

export default defineConfig({
  environment: env.get('APP_ENV'),
  serviceName: env.get('APP_NAME'),
  serviceVersion: env.get('APP_VERSION'),
})
