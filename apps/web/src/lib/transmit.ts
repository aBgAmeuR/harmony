import { Transmit } from '@adonisjs/transmit-client'

export const transmit = new Transmit({
  baseUrl: 'http://localhost:3333/api/v1',
})
