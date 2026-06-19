import { HttpClient } from './http/http-client.js'

export abstract class Manager {
  protected readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }
}
