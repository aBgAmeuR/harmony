import { configApp } from '@adonisjs/eslint-config'

export default [{ ignores: ['database/schema.ts'] }, ...configApp()]
