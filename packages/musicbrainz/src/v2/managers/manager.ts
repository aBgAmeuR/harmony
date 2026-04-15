import type { HttpClient } from '../http-client.js'

export abstract class Manager {
  constructor(protected readonly http: HttpClient) {}
}
